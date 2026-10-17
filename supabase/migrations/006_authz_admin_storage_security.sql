-- ============================================================
-- Migration 006: Server authorization + storage + plan fixes
--
-- Non-destructive: all statements use IF NOT EXISTS / IF EXISTS,
-- DROP POLICY (safe to re-run), ALTER TABLE ADD COLUMN IF NOT EXISTS,
-- and CREATE OR REPLACE for functions/triggers.
--
-- 1. Create admin_users table + promote_admin() / demote_admin()
--    (Source of truth for admin status; also mirrors to JWT via
--     the auth.users.app_metadata.role claim — but a DB-side table
--     is required for API-side verification without round-tripping
--     through GoTrue's JWT validate step.)
-- 2. Fix user_usage RLS: end-users CANNOT write plan / paid_credits.
--    Replace the broad "Users can update own usage" policy with one
--    limited to profession/self-serve fields only. Add CHECK constraints.
-- 3. Fix payments.payment_status / plan CHECK constraints and indexes.
-- 4. Add affitor_click_id + razorpay webhook payload audit columns to payments.
-- 5. Fix pdf-uploads storage RLS: users only read/write their own folder,
--    anon uploads are isolated per random path prefix.
-- 6. Create consume_paid_credit() RPC used by server helpers for atomic
--    credit consumption (guards against double-spend and negative balances).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ADMIN ROLES (admin_users table + RPC helpers)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Nobody reads or writes admin_users via the anon/authenticated roles.
-- Only the service_role client (API routes) touches this table via
-- requireAdmin() checks in application code. We still add RLS policies
-- as defence-in-depth so an accidental anon client call cannot enumerate admins.
DROP POLICY IF EXISTS "admin_users: self read only" ON admin_users;
CREATE POLICY "admin_users: self read only"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Promote / demote helpers (callable only by service_role because we
-- never expose these via anon API; they're invoked manually via SQL).
CREATE OR REPLACE FUNCTION promote_admin(target_id uuid, maker_id uuid DEFAULT NULL, admin_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only a current admin OR service_role may promote another user.
  -- auth.role() = 'service_role' works because the Supabase service_role
  -- key bypasses RLS and sets the DB role to `service_role`.
  IF auth.role() <> 'service_role'
     AND NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only admins may promote other users.';
  END IF;

  INSERT INTO admin_users (user_id, created_by, note)
  VALUES (target_id, maker_id, admin_note)
  ON CONFLICT (user_id) DO NOTHING;

  -- Mirror into app_metadata so Supabase JWTs include `role: admin`.
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb,
      updated_at = now()
  WHERE id = target_id;
END;
$$;

CREATE OR REPLACE FUNCTION demote_admin(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only admins may demote other users.';
  END IF;

  DELETE FROM admin_users WHERE user_id = target_id;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) - 'role',
      updated_at = now()
  WHERE id = target_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 2. user_usage — HARDEN WRITE ACCESS
--    Users must never be able to change their own plan or
--    paid_credits. Only the service_role / payment-verification
--    endpoint can touch those columns. Users may still upsert
--    their own row for profession and conversions_used book-keeping.
-- ────────────────────────────────────────────────────────────

-- Drop the legacy broad update policy.
DROP POLICY IF EXISTS "Users can update own usage" ON user_usage;

-- Replace with a policy that only allows self-service fields.
DROP POLICY IF EXISTS "Users can update own usage (self-serve only)" ON user_usage;
CREATE POLICY "Users can update own usage (self-serve only)"
  ON user_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Prohibit changing plan / paid_credits from the client.
    AND plan = (SELECT plan FROM user_usage uu WHERE uu.user_id = auth.uid())
    AND paid_credits = (SELECT paid_credits FROM user_usage uu WHERE uu.user_id = auth.uid())
  );

-- Insert policy remains: users can create their own initial row,
-- but only with sensible defaults for plan/paid_credits.
DROP POLICY IF EXISTS "Users can insert own usage" ON user_usage;
CREATE POLICY "Users can insert own usage"
  ON user_usage FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (plan IS NULL OR plan = 'free')
    AND (paid_credits IS NULL OR paid_credits = 0)
  );

-- Strengthen the CHECK constraint for plan.
ALTER TABLE user_usage
  DROP CONSTRAINT IF EXISTS user_usage_plan_check;
ALTER TABLE user_usage
  ADD CONSTRAINT user_usage_plan_check
  CHECK (plan IN ('free', 'lifetime', 'payg'));

-- paid_credits can never be negative (prevents consumption bugs).
ALTER TABLE user_usage
  DROP CONSTRAINT IF EXISTS user_usage_paid_credits_non_negative;
ALTER TABLE user_usage
  ADD CONSTRAINT user_usage_paid_credits_non_negative
  CHECK (paid_credits >= 0);

ALTER TABLE user_usage
  ALTER COLUMN plan SET DEFAULT 'free';
ALTER TABLE user_usage
  ALTER COLUMN paid_credits SET DEFAULT 0;

-- Indexes frequently used in API lookups + admin queries.
CREATE INDEX IF NOT EXISTS idx_user_usage_plan ON user_usage(plan);
CREATE INDEX IF NOT EXISTS idx_user_usage_paid_credits ON user_usage(paid_credits)
  WHERE paid_credits > 0;

-- ────────────────────────────────────────────────────────────
-- 3. payments — add CHECK constraints + plan column + indexes
-- ────────────────────────────────────────────────────────────

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS plan text;

ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_plan_check;
ALTER TABLE payments
  ADD CONSTRAINT payments_plan_check
  CHECK (plan IS NULL OR plan IN ('lifetime', 'per_conversion', 'document'));

ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_payment_status_check;
ALTER TABLE payments
  ADD CONSTRAINT payments_payment_status_check
  CHECK (payment_status IN ('created', 'paid', 'signature_failed', 'failed', 'refunded', 'disputed'));

ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_currency_check;
ALTER TABLE payments
  ADD CONSTRAINT payments_currency_check
  CHECK (currency IN ('INR', 'USD'));

-- Affiliate tracking + webhook-proof audit columns.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS affitor_click_id text;
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS razorpay_raw_notes jsonb DEFAULT '{}'::jsonb;
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS disputed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_payments_plan ON payments(plan);
CREATE INDEX IF NOT EXISTS idx_payments_user_created ON payments(user_id, created_at DESC);

-- Razorpay order & payment IDs should be unique per row so verify is idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id_unique
  ON payments(razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 4. token_usage — updated defaults for Vertex/Gemini
-- ────────────────────────────────────────────────────────────

ALTER TABLE token_usage
  ALTER COLUMN model SET DEFAULT 'gemini-2.5-flash-lite';

-- ────────────────────────────────────────────────────────────
-- 5. pdf-uploads storage — PRIVACY FIX
--    Previously anon + authenticated could read any file.
--    Now: owners read/write their own folder prefix only.
--    Anon uploads are put under a per-object random path and
--    can only be re-read via signed URLs (which storage.ts
--    produces if needed; for now we keep read access locked to
--    authenticated users reading u/<their uid>/*).
-- ────────────────────────────────────────────────────────────

-- Make sure the bucket exists (idempotent).
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('pdf-uploads', 'pdf-uploads', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Policies are re-created idempotently.
DROP POLICY IF EXISTS "pdf-uploads: allow inserts" ON storage.objects;
DROP POLICY IF EXISTS "pdf-uploads: allow selects" ON storage.objects;
DROP POLICY IF EXISTS "pdf-uploads: allow deletes" ON storage.objects;

DROP POLICY IF EXISTS "pdf-uploads: authenticated insert own prefix" ON storage.objects;
CREATE POLICY "pdf-uploads: authenticated insert own prefix"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pdf-uploads'
    AND (storage.foldername(name))[1] = 'u'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "pdf-uploads: anon insert random prefix" ON storage.objects;
CREATE POLICY "pdf-uploads: anon insert random prefix"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'pdf-uploads'
    AND (storage.foldername(name))[1] = 'anon'
  );

DROP POLICY IF EXISTS "pdf-uploads: authenticated read own" ON storage.objects;
CREATE POLICY "pdf-uploads: authenticated read own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pdf-uploads'
    AND (storage.foldername(name))[1] = 'u'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "pdf-uploads: authenticated delete own" ON storage.objects;
CREATE POLICY "pdf-uploads: authenticated delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pdf-uploads'
    AND (storage.foldername(name))[1] = 'u'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND owner = auth.uid()
  );

-- ────────────────────────────────────────────────────────────
-- 6. consume_paid_credit() RPC — atomic credit consumption.
--    Row-level locking via UPDATE…WHERE paid_credits > 0 prevents
--    double-spends from concurrent API calls. Returns the new
--    paid_credits balance on success, NULL if no credit remained.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION consume_paid_credit(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  -- Quick short-circuit for lifetime users (they never spend credits).
  IF EXISTS (
    SELECT 1 FROM user_usage
    WHERE user_id = p_user_id AND plan = 'lifetime'
  ) THEN
    RETURN (SELECT paid_credits FROM user_usage WHERE user_id = p_user_id LIMIT 1);
  END IF;

  WITH updated AS (
    UPDATE user_usage
    SET paid_credits = paid_credits - 1,
        updated_at = now()
    WHERE user_id = p_user_id
      AND plan <> 'lifetime'
      AND paid_credits > 0
    RETURNING paid_credits
  )
  SELECT paid_credits INTO new_balance FROM updated;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN new_balance;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 7. Ensure updated_at triggers cover user_usage.
--    (Migration 002 already created one; recreate safely for
--    any environments where it's missing.)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_user_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_usage_updated_at ON user_usage;
CREATE TRIGGER trg_user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW EXECUTE FUNCTION update_user_usage_updated_at();
