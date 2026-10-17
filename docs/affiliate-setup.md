# Affitor integration

## Included

- `/affiliate`: 20% commission per eligible sale, linking to https://affitor.com/marketplace/bankstatementtoexcel.
- Site-wide `AffitorProvider`, program `1155`, debug disabled.
- `/r/<code>`: same-origin 307 redirect to `/?aff=<code>` with safe query encoding.
- Successful email registration calls the browser `signup()` method. With an immediate Supabase session, `/api/affiliate/lead` verifies the user before confirming the lead server-side. Email-confirmation signups remain provisional until a payment settles.
- Order creation preserves the `affitor_click_id` cookie in Razorpay order notes alongside the authenticated user ID.
- `/api/affiliate/razorpay-webhook`: verifies the raw-body HMAC signature, fetches authoritative payment/order data, and reports captured sales and refunds through the server SDK. Amounts stay in Razorpay minor units (INR paisa); they are not converted to USD. Payment IDs provide Affitor idempotency keys. Failures return non-2xx for webhook retries.

## Hosting configuration required

1. Set the actual commission to **20%** in Affitor's commission settings. Website text does not change the program's commission rules.
2. Add `AFFITOR_API_KEY` for program 1155 to your hosting provider's server environment. Do not use a `NEXT_PUBLIC_` prefix or paste the key into source code or chat.
3. Add `RAZORPAY_AFFITOR_WEBHOOK_SECRET`, matching a new webhook secret in Razorpay. This is separate from `RAZORPAY_KEY_SECRET`.
4. Configure a Razorpay webhook URL on the deployed canonical host: `https://www.bankstatementtoexcelconverter.com/api/affiliate/razorpay-webhook`. Subscribe to `payment.captured`, `refund.processed`, and `payment.dispute.created`. Use the final host directly so delivery does not depend on a www redirect.
5. Deploy. Existing Razorpay server credentials are reused to verify payment and order details. Tracking failures do not block the existing checkout or access-grant flow.

Razorpay's validation requirements: https://razorpay.com/docs/webhooks/validate-test/

## Verification

Local verification completed: production build and TypeScript checks passed; six integration tests passed; lint passed with one existing `PreviewWorkspace.tsx` hook warning. The browser preview showed the correct join URL and exactly one tracker script tag for program 1155 without debug. The running app returned 307 from `/r/partner-test?aff=wrong` to `/?aff=partner-test`. Server-only Affitor environment variable names were absent from production client bundles. Live attribution has not been verified.

- Run `node --test tests/affiliate.test.cjs`, `npx tsc --noEmit`, and `npm run lint`.
- Open `/affiliate`: check the 20% text and join link.
- In a clean browser, visit `/r/<valid-partner-code>` and check the 307 location is `/?aff=<valid-partner-code>`.
- Confirm the browser loads exactly one `https://api.affitor.com/js/affitor-tracker.js` script with `data-affitor-program-id="1155"` and no debug attribute.
- Confirm `window.affitor.getData()` reports attribution and `affitor_click_id` is stored. A made-up code cannot verify attribution.
- Verify the click and signup in Affitor. For email-confirmation registrations, the browser lead remains provisional until a payment settles.
- Use Razorpay test mode with an appropriate Affitor test program/key to test capture, retry, partial/full refund and dispute delivery. Verify the same payment ID creates only one sale. Do not create fake production purchases to test tracking.
- In production, use Affitor's **Check /r/** and tracking checks after deployment. Confirm a legitimate attributed transaction and commission in its dashboard.

Live click/lead/sale attribution cannot be confirmed solely by local tests. Server credentials, a valid partner code, deployed webhook configuration, and Affitor dashboard checks are required. Monitor failed webhook deliveries and replay them after outages. Dispute reversals are conservative; if a dispute is won, review its commission manually in Affitor.
