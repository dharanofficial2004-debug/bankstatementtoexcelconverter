const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { createHmac } = require('node:crypto');
const ts = require('typescript');
const { NextRequest } = require('next/server');

function loadRoute(file, mocks = {}, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, require: name => name in mocks ? mocks[name] : require(name),
    URL, Buffer, AbortSignal, console: { error() {} }, ...globals,
  }, { filename: file });
  return exports;
}

test('referral redirects keep encoded codes in a single query value on the same origin', () => {
  const { GET } = loadRoute('src/app/r/[code]/route.ts');
  for (const code of ['partner-123', 'a&aff=other', '//evil.example', 'space + percent%']) {
    const response = GET(new NextRequest('https://www.bankstatementtoexcelconverter.com/r/test?aff=attacker'), { params: { code } });
    assert.equal(response.status, 307);
    const target = new URL(response.headers.get('location'));
    assert.equal(target.origin, 'https://www.bankstatementtoexcelconverter.com');
    assert.equal(target.pathname, '/');
    assert.deepEqual([...target.searchParams], [['aff', code]]);
  }
});

function webhookFixture({ saleOk = true, refunded = 0, configured = true, paymentStatus = 'captured' } = {}) {
  const sales = [], refunds = [], fetches = [];
  const affitor = {
    trackSale: async value => { sales.push(value); return { ok: saleOk }; },
    trackRefund: async value => { refunds.push(value); return { ok: true }; },
  };
  const route = loadRoute('src/app/api/affiliate/razorpay-webhook/route.ts', {
    '@/lib/affitor-server': {
      getAffitorServer: () => configured ? affitor : null,
      validAffitorClickId: value => value,
    },
  }, {
    process: { env: { RAZORPAY_AFFITOR_WEBHOOK_SECRET: 'test-secret', RAZORPAY_KEY_ID: 'test-key', RAZORPAY_KEY_SECRET: 'test-key-secret' } },
    fetch: async url => {
      fetches.push(url);
      return Response.json(url.includes('/payments/')
        ? { amount: 19900, currency: 'INR', order_id: 'order_123', status: paymentStatus, amount_refunded: refunded }
        : { notes: { user_id: 'user_123', affitor_click_id: 'clk_123' } });
    },
  });
  function request(event = 'payment.captured', signatureOverride) {
    const body = JSON.stringify({ event, payload: {
      payment: { entity: { id: 'pay_123', amount: 1 } },
      refund: { entity: { payment_id: 'pay_123' } },
      dispute: { entity: { payment_id: 'pay_123' } },
    } });
    return new NextRequest('https://example.com/api/affiliate/razorpay-webhook', {
      method: 'POST', body,
      headers: { 'x-razorpay-signature': signatureOverride ?? createHmac('sha256', 'test-secret').update(body).digest('hex') },
    });
  }
  return { ...route, request, sales, refunds, fetches };
}

test('unsigned and forged webhooks cannot report sales', async () => {
  for (const signature of ['', 'bad', '0'.repeat(64)]) {
    const f = webhookFixture();
    assert.equal((await f.POST(f.request('payment.captured', signature))).status, 401);
    assert.equal(f.fetches.length, 0);
    assert.equal(f.sales.length, 0);
  }
});

test('capture uses server payment amount, INR currency, stored attribution and stable transaction ID', async () => {
  const f = webhookFixture();
  assert.equal((await f.POST(f.request())).status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(f.sales)), [{
    customerExternalId: 'user_123', clickId: 'clk_123', amount: 19900, currency: 'inr', invoiceId: 'pay_123',
  }]);
  assert.equal((await f.POST(f.request())).status, 200);
  assert.equal(f.sales[1].invoiceId, f.sales[0].invoiceId);
});

test('failed tracking returns retryable status and uncaptured payments never produce sales', async () => {
  const failure = webhookFixture({ saleOk: false });
  assert.equal((await failure.POST(failure.request())).status, 502);
  const unpaid = webhookFixture({ paymentStatus: 'authorized' });
  assert.equal((await unpaid.POST(unpaid.request())).status, 502);
  assert.equal(unpaid.sales.length, 0);
  const missing = webhookFixture({ configured: false });
  assert.equal((await missing.POST(missing.request())).status, 503);
});

test('refund before capture establishes sale then reports cumulative refund; disputes reverse sale', async () => {
  const f = webhookFixture({ refunded: 5000 });
  assert.equal((await f.POST(f.request('refund.processed'))).status, 200);
  assert.equal(f.sales.length, 1);
  assert.equal(f.refunds[0].invoiceId, 'pay_123');
  assert.equal(f.refunds[0].refundAmountCents, 5000);
  const dispute = webhookFixture();
  assert.equal((await dispute.POST(dispute.request('payment.dispute.created'))).status, 200);
  assert.equal(dispute.refunds[0].refundAmountCents, undefined);
});

test('lead endpoint rejects missing authentication and derives identity from Supabase', async () => {
  const leads = [];
  const { POST } = loadRoute('src/app/api/affiliate/lead/route.ts', {
    '@/lib/affitor-server': { getAffitorServer: () => ({ trackLead: async value => { leads.push(value); return { ok: true }; } }), validAffitorClickId: value => value },
    '@supabase/supabase-js': { createClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'verified-user', email: 'test@example.com' } } }) } }) },
  }, { process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.com', SUPABASE_SERVICE_ROLE_KEY: 'test-only' } } });
  assert.equal((await POST(new NextRequest('https://example.com/api/affiliate/lead', { method: 'POST' }))).status, 401);
  const response = await POST(new NextRequest('https://example.com/api/affiliate/lead', {
    method: 'POST', headers: { authorization: 'Bearer test-token', cookie: 'affitor_click_id=clk_123' },
    body: JSON.stringify({ customer_key: 'attacker' }),
  }));
  assert.equal(response.status, 200);
  assert.equal(leads[0].customerExternalId, 'verified-user');
});
