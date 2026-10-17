-- ============================================================
-- Migration 009: Architecture fixes — atomic RPCs + schema hardening
--
-- Prerequisites:
--   008_jobs_ledger_attribution.sql must be applied first.
--   Tables confirmed present:
--     entitlement_reservations, conversion_jobs, job_chunks,
--     gemini_attempts, job_outbox, rate_limit_buckets,
--     user_usage (with profession, paid_credits, plan, trial_consumed_at,
--                 acquisition_country, profession_detail),
--     guest_sessions (with trial_used, trial_used_at),
--     payments (with entitlements_applied_at)
--
-- What this migration does:
--   1a. authorize_extraction() RPC — atomic reservation + job creation in one transaction.
--       Replaces multi-step application-level sequence in src/lib/jobs.ts authorizeExtraction().
--   1b. expire_abandoned_reservations() — guards on job status, not lease expiry alone.
--       Skips any reservation whose linked job is in an active status.
--   1c. purge_expired_job_payloads() — never purge text/results for active/retryable jobs.
--   1d. acquisition_source column added to user_usage; conservative backfill from profession.
--       RLS policy updated to also lock acquisition_source and profession_detail from client writes.
--   1e. commit_reservation_for_job() RPC — lease-guarded atomic commit (ready path).
--   1f. release_reservation_for_job() RPC — lease-guarded atomic release + credit restore (fail path).
--   1g. Drop legacy over-permissive "Users can update own usage" policy created by migration 002.
--
-- Rollback notes:
--   To revert: drop the new functions, drop acquisition_source column (data loss),
--   restore prior versions of expire_abandoned_reservations and purge_expired_job_payloads.
--   The 008 versions of those two functions were non-idempotent; re-applying 008 restores them.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1a. authorize_extraction RPC
--     Atomic reservation + job creation in a single transaction.
--     Handles trial (reuse pattern), PAYG (consume credit), and lifetime
--     (no credit consumption, uses 'payg' kind for reservation).
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION authorize_extraction(
  p_owner_type text,
  p_owner_id uuid,
  p_user_id uuid,
  p_guest_session_id uuid,
  p_kind text,           -- 'trial' | 'payg' | 'lifetime'
  p_filename text,
  p_file_size_bytes integer,
  p_pages_authorized integer,
  p_char_budget integer,
  p_extraction_kind text  -- 'text' | 'ocr'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation_id uuid;
  v_job_id uuid;
  v_existing_reservation_id uuid;
  v_existing_job_id uuid;
  v_existing_job_status text;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- For trial: check for existing reserved reservation first (reuse pattern)
  IF p_kind = 'trial' THEN
    SELECT r.id, r.job_id INTO v_existing_reservation_id, v_existing_job_id
    FROM entitlement_reservations r
    WHERE r.owner_type = p_owner_type
      AND r.owner_id = p_owner_id
      AND r.kind = 'trial'
      AND r.status = 'reserved'
    FOR UPDATE
    LIMIT 1;

    IF v_existing_reservation_id IS NOT NULL AND v_existing_job_id IS NOT NULL THEN
      SELECT status INTO v_existing_job_status
      FROM conversion_jobs WHERE id = v_existing_job_id;

      IF v_existing_job_status = 'extract_authorized' THEN
        -- Update job metadata in place, reuse reservation
        UPDATE conversion_jobs SET
          filename = p_filename,
          file_size_bytes = p_file_size_bytes,
          extraction_kind = p_extraction_kind,
          pages_authorized = p_pages_authorized,
          token_budget = p_char_budget,
          updated_at = now()
        WHERE id = v_existing_job_id;
        RETURN jsonb_build_object(
          'reservation_id', v_existing_reservation_id,
          'job_id', v_existing_job_id,
          'reused', true
        );
      END IF;

      IF v_existing_job_status IN ('queued','processing','retrying','validating','uncertain') THEN
        RETURN jsonb_build_object(
          'reservation_id', v_existing_reservation_id,
          'job_id', v_existing_job_id,
          'reused', true
        );
      END IF;
    END IF;
  END IF;

  -- For PAYG: atomically consume one credit
  IF p_kind = 'payg' THEN
    UPDATE user_usage
    SET paid_credits = paid_credits - 1, updated_at = now()
    WHERE user_id = p_user_id
      AND paid_credits > 0
      AND plan <> 'lifetime';
    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'no_credits');
    END IF;
  END IF;

  -- Insert reservation
  INSERT INTO entitlement_reservations (
    owner_type, owner_id, kind, status,
    expires_at
  ) VALUES (
    p_owner_type, p_owner_id,
    CASE p_kind WHEN 'lifetime' THEN 'payg' ELSE p_kind END,  -- lifetime jobs use 'payg' kind with no credit consumed
    'reserved',
    now() + interval '30 minutes'
  )
  RETURNING id INTO v_reservation_id;

  -- Insert job
  BEGIN
    INSERT INTO conversion_jobs (
      owner_type, owner_id, user_id, guest_session_id,
      reservation_id, status, extraction_kind,
      pages_authorized, filename, file_size_bytes,
      token_budget, extracted_text_expires_at
    ) VALUES (
      p_owner_type, p_owner_id, p_user_id, p_guest_session_id,
      v_reservation_id, 'extract_authorized', p_extraction_kind,
      p_pages_authorized, p_filename, p_file_size_bytes,
      p_char_budget, now() + interval '2 hours'
    )
    RETURNING id INTO v_job_id;
  EXCEPTION WHEN OTHERS THEN
    -- Job creation failed: rollback credit and reservation
    IF p_kind = 'payg' THEN
      UPDATE user_usage
      SET paid_credits = paid_credits + 1, updated_at = now()
      WHERE user_id = p_user_id;
    END IF;
    DELETE FROM entitlement_reservations WHERE id = v_reservation_id;
    RETURN jsonb_build_object('error', 'job_create_failed');
  END;

  -- Link job to reservation
  UPDATE entitlement_reservations SET job_id = v_job_id WHERE id = v_reservation_id;

  RETURN jsonb_build_object(
    'reservation_id', v_reservation_id,
    'job_id', v_job_id,
    'reused', false
  );
END;
$$;
REVOKE ALL ON FUNCTION authorize_extraction(text, uuid, uuid, uuid, text, text, integer, integer, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION authorize_extraction(text, uuid, uuid, uuid, text, text, integer, integer, integer, text) TO service_role;

-- ────────────────────────────────────────────────────────────
-- 1b. Fix expire_abandoned_reservations — guard on job status, not lease
--     Skips ANY reservation whose linked job is in an active status,
--     regardless of whether the lease has expired.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION expire_abandoned_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
  v_res RECORD;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  FOR v_res IN
    SELECT r.id, r.kind, r.owner_type, r.owner_id, j.user_id
    FROM entitlement_reservations r
    LEFT JOIN conversion_jobs j ON j.id = r.job_id
    WHERE r.status = 'reserved'
      AND r.expires_at < now()
      AND (
        r.job_id IS NULL
        OR j.status NOT IN ('queued','processing','retrying','validating','uncertain','extract_authorized')
      )
    FOR UPDATE OF r
  LOOP
    UPDATE entitlement_reservations
    SET status = 'expired', updated_at = now(), released_at = now()
    WHERE id = v_res.id;

    -- Restore PAYG credit atomically in same transaction
    IF v_res.kind = 'payg' AND v_res.owner_type = 'user' AND v_res.user_id IS NOT NULL THEN
      UPDATE user_usage
      SET paid_credits = paid_credits + 1, updated_at = now()
      WHERE user_id = v_res.user_id;
    END IF;
  END LOOP;

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN COALESCE(n, 0);
END;
$$;
REVOKE ALL ON FUNCTION expire_abandoned_reservations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION expire_abandoned_reservations() TO service_role;

-- ────────────────────────────────────────────────────────────
-- 1c. Fix purge_expired_job_payloads — never purge active/retryable jobs
-- ────────────────────────────────────────────────────────────
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

  -- Only purge extracted_text for completed/failed/non-active jobs
  UPDATE conversion_jobs
  SET extracted_text = NULL, updated_at = now()
  WHERE extracted_text IS NOT NULL
    AND extracted_text_expires_at IS NOT NULL
    AND extracted_text_expires_at < now()
    AND status NOT IN ('queued', 'processing', 'retrying', 'validating', 'uncertain', 'extract_authorized');
  GET DIAGNOSTICS n = ROW_COUNT;

  -- Purge chunk input_text only for jobs whose extracted_text is already gone
  UPDATE job_chunks c
  SET input_text = NULL
  FROM conversion_jobs j
  WHERE c.job_id = j.id
    AND c.input_text IS NOT NULL
    AND j.extracted_text IS NULL
    AND j.status NOT IN ('queued', 'processing', 'retrying', 'validating', 'uncertain');

  -- Purge result data after result_expires_at
  UPDATE conversion_jobs
  SET result_json = NULL, edited_result_json = NULL, updated_at = now()
  WHERE result_expires_at IS NOT NULL
    AND result_expires_at < now()
    AND status IN ('ready', 'failed');

  -- Purge chunk output_json after result_expires_at
  UPDATE job_chunks c
  SET output_json = NULL
  FROM conversion_jobs j
  WHERE c.job_id = j.id
    AND c.output_json IS NOT NULL
    AND j.result_expires_at IS NOT NULL
    AND j.result_expires_at < now()
    AND j.status IN ('ready', 'failed');

  RETURN COALESCE(n, 0);
END;
$$;
REVOKE ALL ON FUNCTION purge_expired_job_payloads() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purge_expired_job_payloads() TO service_role;

-- ────────────────────────────────────────────────────────────
-- 1d. Add acquisition_source column to user_usage
--     Conservative backfill from profession for known acquisition-source values.
--     RLS policy updated to lock acquisition_source and profession_detail.
-- ────────────────────────────────────────────────────────────
ALTER TABLE user_usage
  ADD COLUMN IF NOT EXISTS acquisition_source text;

-- Backfill: if existing profession value looks like an acquisition source option, move it
-- Known acquisition source values (conservative list - only exact matches)
UPDATE user_usage
SET acquisition_source = profession
WHERE acquisition_source IS NULL
  AND profession IN (
    'Google Search', 'YouTube', 'LinkedIn', 'Twitter', 'Facebook',
    'Friend referral', 'Blog post', 'Other', 'Others'
  );

-- Update RLS policy to also lock acquisition_source and profession_detail from client writes
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
    AND COALESCE(acquisition_source, '') = COALESCE((SELECT acquisition_source FROM user_usage uu WHERE uu.user_id = auth.uid()), '')
    AND COALESCE(profession_detail, '') = COALESCE((SELECT profession_detail FROM user_usage uu WHERE uu.user_id = auth.uid()), '')
  );

-- ────────────────────────────────────────────────────────────
-- 1e. commit_reservation_for_job RPC — lease-guarded atomic commit
--     Called by worker when a job completes successfully.
--     Sets status='ready', clears extracted_text, clears lease,
--     commits reservation, marks trial used, increments conversions_used.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION commit_reservation_for_job(
  p_job_id uuid,
  p_worker_id text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job conversion_jobs%ROWTYPE;
  v_reservation_id uuid;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Lock and verify lease ownership
  SELECT * INTO v_job
  FROM conversion_jobs
  WHERE id = p_job_id
    AND lease_owner = p_worker_id
    AND status = 'processing'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'lease_lost';
  END IF;

  v_reservation_id := v_job.reservation_id;

  -- Commit reservation
  IF v_reservation_id IS NOT NULL THEN
    UPDATE entitlement_reservations
    SET status = 'committed', committed_at = now(), updated_at = now()
    WHERE id = v_reservation_id
      AND status = 'reserved';
  END IF;

  -- Mark trial used for guest
  IF v_job.owner_type = 'guest' AND v_job.guest_session_id IS NOT NULL THEN
    UPDATE guest_sessions
    SET trial_used = true, trial_used_at = now()
    WHERE id = v_job.guest_session_id
      AND trial_used = false;
  END IF;

  -- Increment conversions_used for user
  IF v_job.user_id IS NOT NULL THEN
    INSERT INTO user_usage (user_id, conversions_used, plan, paid_credits, updated_at)
    VALUES (v_job.user_id, 1, 'free', 0, now())
    ON CONFLICT (user_id) DO UPDATE
      SET conversions_used = user_usage.conversions_used + 1,
          trial_consumed_at = COALESCE(user_usage.trial_consumed_at, now()),
          updated_at = now();
  END IF;

  -- Mark job ready (caller sets result_json separately)
  UPDATE conversion_jobs
  SET
    status = 'ready',
    progress_stage = 'ready',
    extracted_text = NULL,
    lease_owner = NULL,
    lease_expires_at = NULL,
    result_expires_at = now() + interval '90 days',
    updated_at = now()
  WHERE id = p_job_id
    AND lease_owner = p_worker_id;

  IF NOT FOUND THEN
    RETURN 'lease_lost_on_ready';
  END IF;

  RETURN 'committed';
END;
$$;
REVOKE ALL ON FUNCTION commit_reservation_for_job(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION commit_reservation_for_job(uuid, text) TO service_role;

-- ────────────────────────────────────────────────────────────
-- 1f. release_reservation_for_job RPC — lease-guarded atomic release + credit restore
--     Called by worker when a job fails permanently (attempt limit reached).
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION release_reservation_for_job(
  p_job_id uuid,
  p_worker_id text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job conversion_jobs%ROWTYPE;
  v_reservation entitlement_reservations%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Lock and verify lease ownership
  SELECT * INTO v_job
  FROM conversion_jobs
  WHERE id = p_job_id
    AND lease_owner = p_worker_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'lease_lost';
  END IF;

  IF v_job.reservation_id IS NOT NULL THEN
    SELECT * INTO v_reservation
    FROM entitlement_reservations
    WHERE id = v_job.reservation_id
      AND status = 'reserved'
    FOR UPDATE;

    IF FOUND THEN
      UPDATE entitlement_reservations
      SET status = 'released', released_at = now(), updated_at = now()
      WHERE id = v_job.reservation_id;

      -- Restore PAYG credit if applicable
      IF v_reservation.kind = 'payg' AND v_job.user_id IS NOT NULL THEN
        UPDATE user_usage
        SET paid_credits = paid_credits + 1, updated_at = now()
        WHERE user_id = v_job.user_id;
      END IF;
    END IF;
  END IF;

  UPDATE conversion_jobs
  SET
    status = 'failed',
    progress_stage = 'failed',
    lease_owner = NULL,
    lease_expires_at = NULL,
    last_error_code = 'convert_failed',
    updated_at = now()
  WHERE id = p_job_id
    AND lease_owner = p_worker_id;

  IF NOT FOUND THEN
    RETURN 'lease_lost_on_fail';
  END IF;

  RETURN 'released';
END;
$$;
REVOKE ALL ON FUNCTION release_reservation_for_job(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION release_reservation_for_job(uuid, text) TO service_role;

-- ────────────────────────────────────────────────────────────
-- 1g. Drop legacy over-permissive "Users can update own usage" policy
--     This was created by migration 002 and is superseded by the
--     more restrictive "Users can update own usage (self-serve only)"
--     policy updated above.
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can update own usage" ON user_usage;

-- ============================================================
-- End of migration 009
-- ============================================================
