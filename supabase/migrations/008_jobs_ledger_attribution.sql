-- ============================================================
-- Migration 008: conversion jobs, entitlement ledger, Gemini
-- accounting, attribution, rate limits, payment apply-once.
--
-- Non-destructive. Does not reset user_usage, payments, or credits.
-- Order: apply after 007. Rollback: DROP the new tables/functions
-- (data in conversion_jobs / gemini_attempts would be lost).
-- Backfill: none required for entitlements. Historical "0 conversions"
-- is not fabricated; dashboards should count conversion_jobs with
-- status = 'ready' plus legacy conversions/user_usage as labeled series.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Lock down DEFINER RPCs from 006/007 (default PUBLIC execute)
-- Safe even if functions don't exist yet (DO block catches errors)
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN REVOKE ALL ON FUNCTION consume_paid_credit(uuid) FROM PUBLIC; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN REVOKE ALL ON FUNCTION reserve_guest_trial(uuid) FROM PUBLIC; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN REVOKE ALL ON FUNCTION consume_guest_trial(uuid, uuid) FROM PUBLIC; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN REVOKE ALL ON FUNCTION link_guest_session_to_user(uuid, uuid) FROM PUBLIC; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN REVOKE ALL ON FUNCTION promote_admin(uuid, uuid, text) FROM PUBLIC; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN REVOKE ALL ON FUNCTION demote_admin(uuid) FROM PUBLIC; EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- ────────────────────────────────────────────────────────────
-- user_usage: freeze conversions_used from the browser; Other detail
-- ────────────────────────────────────────────────────────────
ALTER TABLE user_usage
  ADD COLUMN IF NOT EXISTS profession_detail text;
ALTER TABLE user_usage
  ADD COLUMN IF NOT EXISTS trial_consumed_at timestamptz;
ALTER TABLE user_usage
  ADD COLUMN IF NOT EXISTS acquisition_country text;

DROP POLICY IF EXISTS "Users can update own usage (self-serve only)" ON user_usage;
CREATE POLICY "Users can update own usage (self-serve only)"
  ON user_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND plan = (SELECT plan FROM user_usage uu WHERE uu.user_id = auth.uid())
    AND paid_credits = (SELECT paid_credits FROM user_usage uu WHERE uu.user_id = auth.uid())
    AND conversions_used = (SELECT conversions_used FROM user_usage uu WHERE uu.user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────
-- payments: apply-once + attribution snapshot (no grant from UI)
-- ────────────────────────────────────────────────────────────
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS entitlements_applied_at timestamptz;
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS razorpay_event_id text;
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_insert_status_created;
-- Authenticated clients must not insert already-paid rows.
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
CREATE POLICY "Users can insert their own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND payment_status = 'created'
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_event_id
  ON payments(razorpay_event_id)
  WHERE razorpay_event_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- guest_sessions extra fields
-- ────────────────────────────────────────────────────────────
ALTER TABLE guest_sessions
  ADD COLUMN IF NOT EXISTS cookie_hash text;
ALTER TABLE guest_sessions
  ADD COLUMN IF NOT EXISTS failed_trial_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE guest_sessions
  ADD COLUMN IF NOT EXISTS last_extract_fingerprint text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_sessions_cookie_hash
  ON guest_sessions(cookie_hash)
  WHERE cookie_hash IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- Rate-limit buckets (shared across instances)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  hit_count integer NOT NULL DEFAULT 0
);

ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rate_limit: nobody" ON rate_limit_buckets;
CREATE POLICY "rate_limit: nobody"
  ON rate_limit_buckets FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION hit_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_max integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_start timestamptz;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO rate_limit_buckets (bucket_key, window_started_at, hit_count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (bucket_key) DO UPDATE
    SET
      window_started_at = CASE
        WHEN rate_limit_buckets.window_started_at < now() - make_interval(secs => p_window_seconds)
        THEN now() ELSE rate_limit_buckets.window_started_at END,
      hit_count = CASE
        WHEN rate_limit_buckets.window_started_at < now() - make_interval(secs => p_window_seconds)
        THEN 1 ELSE rate_limit_buckets.hit_count + 1 END
  RETURNING hit_count, window_started_at INTO v_count, v_start;

  RETURN v_count <= p_max;
END;
$$;
REVOKE ALL ON FUNCTION hit_rate_limit(text, integer, integer) FROM PUBLIC;

-- ────────────────────────────────────────────────────────────
-- Entitlement reservations (trial / payg credit)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entitlement_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  owner_type text NOT NULL CHECK (owner_type IN ('user', 'guest')),
  owner_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('trial', 'payg')),
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'committed', 'released', 'expired')),
  job_id uuid,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  committed_at timestamptz,
  released_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_entitlement_one_active_trial
  ON entitlement_reservations(owner_type, owner_id)
  WHERE kind = 'trial' AND status = 'reserved';

CREATE UNIQUE INDEX IF NOT EXISTS idx_entitlement_job
  ON entitlement_reservations(job_id)
  WHERE job_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_entitlement_owner
  ON entitlement_reservations(owner_type, owner_id, status);

ALTER TABLE entitlement_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "entitlement_reservations: nobody" ON entitlement_reservations;
CREATE POLICY "entitlement_reservations: nobody"
  ON entitlement_reservations FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- ────────────────────────────────────────────────────────────
-- Conversion jobs + chunks
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  owner_type text NOT NULL CHECK (owner_type IN ('user', 'guest')),
  owner_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_session_id uuid REFERENCES guest_sessions(id) ON DELETE SET NULL,
  reservation_id uuid REFERENCES entitlement_reservations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'extract_authorized'
    CHECK (status IN (
      'extract_authorized', 'queued', 'processing', 'retrying',
      'validating', 'ready', 'failed', 'uncertain'
    )),
  extraction_kind text CHECK (extraction_kind IN ('text', 'ocr')),
  pages_authorized integer NOT NULL DEFAULT 0,
  pages_submitted integer,
  filename text,
  file_size_bytes integer,
  extracted_char_count integer,
  extracted_text text,
  extracted_text_expires_at timestamptz,
  result_json jsonb,
  edited_result_json jsonb,
  result_expires_at timestamptz,
  progress_stage text,
  chunks_total integer NOT NULL DEFAULT 0,
  chunks_done integer NOT NULL DEFAULT 0,
  support_ref text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  retry_count integer NOT NULL DEFAULT 0,
  retry_after timestamptz,
  lease_owner text,
  lease_expires_at timestamptz,
  last_error_code text,
  last_error_internal text,
  validation_notices jsonb NOT NULL DEFAULT '[]'::jsonb,
  token_budget integer,
  CONSTRAINT conversion_jobs_owner_chk CHECK (
    (owner_type = 'user' AND user_id IS NOT NULL)
    OR (owner_type = 'guest' AND guest_session_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_jobs_owner ON conversion_jobs(owner_type, owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON conversion_jobs(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON conversion_jobs(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE conversion_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversion_jobs: nobody" ON conversion_jobs;
CREATE POLICY "conversion_jobs: nobody"
  ON conversion_jobs FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE TABLE IF NOT EXISTS job_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES conversion_jobs(id) ON DELETE CASCADE,
  seq integer NOT NULL,
  input_excerpt_hash text,
  input_text text,
  output_json jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'leased', 'succeeded', 'failed', 'uncertain')),
  lease_owner text,
  lease_expires_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0,
  UNIQUE (job_id, seq)
);

CREATE INDEX IF NOT EXISTS idx_job_chunks_job ON job_chunks(job_id, seq);

ALTER TABLE job_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "job_chunks: nobody" ON job_chunks;
CREATE POLICY "job_chunks: nobody"
  ON job_chunks FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

ALTER TABLE entitlement_reservations
  DROP CONSTRAINT IF EXISTS entitlement_reservations_job_id_fkey;
ALTER TABLE entitlement_reservations
  ADD CONSTRAINT entitlement_reservations_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES conversion_jobs(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────
-- Gemini attempt accounting (persist before/after provider call)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gemini_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid REFERENCES conversion_jobs(id) ON DELETE SET NULL,
  chunk_id uuid REFERENCES job_chunks(id) ON DELETE SET NULL,
  owner_type text,
  owner_id uuid,
  attempt_no integer NOT NULL DEFAULT 1,
  operation text NOT NULL DEFAULT 'parse_statement',
  model text,
  location text,
  endpoint text,
  provider_response_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms integer,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  cached_tokens integer,
  thinking_tokens integer,
  raw_usage jsonb,
  status text NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'succeeded', 'failed', 'uncertain', 'invalid_json')),
  finish_reason text,
  retry_reason text,
  sanitized_error text,
  pricing_version text,
  estimated_cost_usd numeric(14, 8)
);

CREATE INDEX IF NOT EXISTS idx_gemini_attempts_job ON gemini_attempts(job_id, started_at);
CREATE INDEX IF NOT EXISTS idx_gemini_attempts_started ON gemini_attempts(started_at DESC);

ALTER TABLE gemini_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gemini_attempts: nobody" ON gemini_attempts;
CREATE POLICY "gemini_attempts: nobody"
  ON gemini_attempts FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- ────────────────────────────────────────────────────────────
-- Transactional outbox
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid NOT NULL REFERENCES conversion_jobs(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error text
);

CREATE INDEX IF NOT EXISTS idx_job_outbox_pending
  ON job_outbox(next_attempt_at)
  WHERE status = 'pending';

ALTER TABLE job_outbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "job_outbox: nobody" ON job_outbox;
CREATE POLICY "job_outbox: nobody"
  ON job_outbox FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- ────────────────────────────────────────────────────────────
-- Attribution (first-touch preserved)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_attribution (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_id uuid REFERENCES guest_sessions(id) ON DELETE SET NULL,
  first_touch jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_touch jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_captured_at timestamptz NOT NULL DEFAULT now(),
  last_captured_at timestamptz NOT NULL DEFAULT now(),
  signup_path text,
  acquisition_country text
);

ALTER TABLE user_attribution ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_attribution: self read" ON user_attribution;
CREATE POLICY "user_attribution: self read"
  ON user_attribution FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS guest_attribution (
  guest_session_id uuid PRIMARY KEY REFERENCES guest_sessions(id) ON DELETE CASCADE,
  first_touch jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_touch jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_captured_at timestamptz NOT NULL DEFAULT now(),
  last_captured_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE guest_attribution ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "guest_attribution: nobody" ON guest_attribution;
CREATE POLICY "guest_attribution: nobody"
  ON guest_attribution FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- ────────────────────────────────────────────────────────────
-- Admin audit
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_audit: nobody" ON admin_audit;
CREATE POLICY "admin_audit: nobody"
  ON admin_audit FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- ────────────────────────────────────────────────────────────
-- Model pricing versions (effective-dated; not OpenAI)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gemini_pricing (
  version text PRIMARY KEY,
  effective_from date NOT NULL,
  model text NOT NULL,
  input_usd_per_million numeric(12, 6) NOT NULL,
  output_usd_per_million numeric(12, 6) NOT NULL,
  notes text
);

INSERT INTO gemini_pricing (version, effective_from, model, input_usd_per_million, output_usd_per_million, notes)
VALUES (
  'gemini-2.5-flash-lite:2026-06-01',
  '2026-06-01',
  'gemini-2.5-flash-lite',
  0.10,
  0.40,
  'Vertex list prices used for estimates only; not provider invoices.'
)
ON CONFLICT (version) DO NOTHING;

ALTER TABLE gemini_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gemini_pricing: nobody" ON gemini_pricing;
CREATE POLICY "gemini_pricing: nobody"
  ON gemini_pricing FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- ────────────────────────────────────────────────────────────
-- Atomic helpers
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_conversions_used(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO user_usage (user_id, conversions_used, plan, paid_credits, updated_at)
  VALUES (p_user_id, 1, 'free', 0, now())
  ON CONFLICT (user_id) DO UPDATE
    SET conversions_used = user_usage.conversions_used + 1,
        updated_at = now()
  RETURNING conversions_used INTO v_next;
  RETURN v_next;
END;
$$;
REVOKE ALL ON FUNCTION increment_conversions_used(uuid) FROM PUBLIC;

CREATE OR REPLACE FUNCTION grant_payg_credits(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid amount';
  END IF;
  INSERT INTO user_usage (user_id, conversions_used, plan, paid_credits, updated_at)
  VALUES (p_user_id, 0, 'payg', p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
    SET paid_credits = user_usage.paid_credits + p_amount,
        plan = CASE WHEN user_usage.plan = 'lifetime' THEN 'lifetime' ELSE 'payg' END,
        updated_at = now()
  RETURNING paid_credits INTO v_next;
  RETURN v_next;
END;
$$;
REVOKE ALL ON FUNCTION grant_payg_credits(uuid, integer) FROM PUBLIC;

CREATE OR REPLACE FUNCTION apply_verified_payment(p_payment_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pay payments%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_pay FROM payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN 'missing';
  END IF;
  IF v_pay.entitlements_applied_at IS NOT NULL THEN
    RETURN 'already_applied';
  END IF;
  IF v_pay.payment_status IS DISTINCT FROM 'paid' THEN
    RETURN 'not_paid';
  END IF;

  IF v_pay.plan = 'lifetime' THEN
    INSERT INTO user_usage (user_id, plan, paid_credits, conversions_used, updated_at)
    VALUES (v_pay.user_id, 'lifetime', 0, 0, now())
    ON CONFLICT (user_id) DO UPDATE
      SET plan = 'lifetime', updated_at = now();
  ELSIF v_pay.plan = 'per_conversion' THEN
    PERFORM grant_payg_credits(v_pay.user_id, 1);
  END IF;

  UPDATE payments
  SET entitlements_applied_at = now()
  WHERE id = p_payment_id;

  RETURN 'applied';
END;
$$;
REVOKE ALL ON FUNCTION apply_verified_payment(uuid) FROM PUBLIC;

CREATE OR REPLACE FUNCTION expire_abandoned_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  WITH live AS (
    SELECT reservation_id
    FROM conversion_jobs
    WHERE reservation_id IS NOT NULL
      AND status IN ('queued', 'processing', 'retrying', 'validating', 'uncertain')
  ),
  upd AS (
    UPDATE entitlement_reservations r
    SET status = 'expired', updated_at = now(), released_at = now()
    WHERE r.status = 'reserved'
      AND r.expires_at < now()
      AND (r.job_id IS NULL OR r.id NOT IN (SELECT reservation_id FROM live WHERE reservation_id IS NOT NULL))
    RETURNING 1
  )
  SELECT COUNT(*) INTO n FROM upd;
  RETURN n;
END;
$$;
REVOKE ALL ON FUNCTION expire_abandoned_reservations() FROM PUBLIC;

CREATE OR REPLACE FUNCTION purge_expired_job_payloads()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE conversion_jobs
  SET extracted_text = NULL, updated_at = now()
  WHERE extracted_text IS NOT NULL
    AND extracted_text_expires_at IS NOT NULL
    AND extracted_text_expires_at < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  UPDATE conversion_jobs
  SET result_json = NULL, edited_result_json = NULL, updated_at = now()
  WHERE result_expires_at IS NOT NULL
    AND result_expires_at < now()
    AND status IN ('ready', 'failed');
  UPDATE job_chunks SET input_text = NULL
  WHERE job_id IN (
    SELECT id FROM conversion_jobs
    WHERE extracted_text_expires_at IS NOT NULL AND extracted_text_expires_at < now()
  );
  RETURN n;
END;
$$;
REVOKE ALL ON FUNCTION purge_expired_job_payloads() FROM PUBLIC;

CREATE OR REPLACE FUNCTION is_admin_user(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = p_user_id);
$$;
REVOKE ALL ON FUNCTION is_admin_user(uuid) FROM PUBLIC;
