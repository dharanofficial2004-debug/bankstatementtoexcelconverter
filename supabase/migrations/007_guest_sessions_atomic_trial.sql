-- ============================================================
-- Migration 007: Server-side guest sessions + atomic trial reservation
--
-- Goals:
--   * Replace client-only localStorage "free_conversion_used" with a
--     durable, server-side allowance keyed by (ip_hash, ua_hash, session_id)
--     triplet so duplicates, private-browsing bypasses, and localStorage
--     resets cannot obtain multiple free conversions.
--   * Allow signed-out ("guest") users to call every processing API while
--     still enforcing exactly-one free conversion per guest before the
--     paywall.  The same guest session may later be linked to a real user
--     account (on signup) so the trial is NOT reset on account creation.
--   * Reserve-then-consume two-phase pattern:
--       1. authorizeConversion() calls reserve_guest_trial() → holds a
--          short-lived reservation (~90s) via trial_reserved_until so
--          concurrent duplicate requests from one user can't win 2 slots.
--       2. On successful parse completion the backend calls
--          consume_guest_trial() → permanently flips trial_used=true.
--   * Attribution: token_usage and payments gain optional guest_session_id
--     so admin analytics can cross-reference signed-out requests.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- guest_sessions table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guest_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  ip_hash text NOT NULL,
  user_agent_hash text NOT NULL,
  linked_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_at timestamptz,
  trial_used boolean NOT NULL DEFAULT false,
  trial_used_at timestamptz,
  trial_reserved_until timestamptz,
  trial_reservation_nonce uuid,
  linked_user_conversions_locked boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_ip_ua
  ON guest_sessions(ip_hash, user_agent_hash)
  WHERE linked_user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_guest_sessions_linked_user
  ON guest_sessions(linked_user_id)
  WHERE linked_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guest_sessions_reservation
  ON guest_sessions(id, trial_reserved_until, trial_used);
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_sessions_nonce
  ON guest_sessions(trial_reservation_nonce)
  WHERE trial_reservation_nonce IS NOT NULL;

ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Never expose guest_sessions to anon/authenticated.  Only the service_role
-- API routes touch this table (as a defence-in-depth measure).
DROP POLICY IF EXISTS "guest_sessions: nobody reads" ON guest_sessions;
CREATE POLICY "guest_sessions: nobody reads"
  ON guest_sessions FOR SELECT
  TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "guest_sessions: nobody writes" ON guest_sessions;
CREATE POLICY "guest_sessions: nobody writes"
  ON guest_sessions FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ────────────────────────────────────────────────────────────
-- reserve_guest_trial(session_id)
--
-- Atomically transitions a guest_session into a "reserved" state for
-- 90 seconds.  Returns the new reservation_nonce on success, NULL if the
-- guest's trial is already used / reserved / linked to an account whose
-- free conversion was already consumed.
--
-- Also performs an anti-abuse pre-check: a single (ip_hash, ua_hash) can
-- hold no more than 5 active trial-linked guest_sessions total (prevents
-- calling issue-session 1000 times to gain 1000 free trials even with
-- storage wipe between each).
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION reserve_guest_trial(p_session_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation_nonce uuid;
  v_ip_hash text;
  v_ua_hash text;
  v_used boolean;
  v_linked uuid;
  v_reserved_until timestamptz;
  v_siblings integer;
BEGIN
  -- Load + lock the row to avoid concurrent reservations.
  SELECT ip_hash, user_agent_hash, trial_used, linked_user_id, trial_reserved_until
    INTO v_ip_hash, v_ua_hash, v_used, v_linked, v_reserved_until
  FROM guest_sessions
  WHERE id = p_session_id
  FOR UPDATE
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_used THEN
    RETURN NULL;
  END IF;

  IF v_linked IS NOT NULL THEN
    -- Guest already linked to a real user.
    -- Delegate to the user account's own free-slot/credits/lifetime
    -- entitlement by returning NULL — the caller falls through to the
    -- user-specific authorizeConversion path.
    RETURN NULL;
  END IF;

  -- Sibling session cap for this (ip, ua) bucket — at most 5 active
  -- sessions that haven't expired and have trial_used = false.
  SELECT COUNT(*) INTO v_siblings
  FROM guest_sessions
  WHERE ip_hash = v_ip_hash
    AND user_agent_hash = v_ua_hash
    AND linked_user_id IS NULL
    AND NOT trial_used
    AND expires_at > now();

  IF v_siblings > 5 THEN
    RETURN NULL;
  END IF;

  -- If a reservation already exists and hasn't expired, return the
  -- existing nonce instead of issuing a new one — idempotent.
  IF v_reserved_until IS NOT NULL AND v_reserved_until > now() THEN
    SELECT trial_reservation_nonce INTO v_reservation_nonce
    FROM guest_sessions WHERE id = p_session_id;
    RETURN v_reservation_nonce;
  END IF;

  -- New reservation.
  v_reservation_nonce := gen_random_uuid();

  UPDATE guest_sessions
  SET
    trial_reserved_until = now() + interval '90 seconds',
    trial_reservation_nonce = v_reservation_nonce
  WHERE id = p_session_id;

  RETURN v_reservation_nonce;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- consume_guest_trial(session_id, nonce)
--
-- Finalises a previously reserved trial as "permanently consumed".
-- Returns TRUE on success, FALSE if the reservation was already spent,
-- the nonce mismatch, or the reservation timed out.
--
-- Once consumed, the same guest session (and its linked user) can never
-- re-earn a free conversion via the guest path.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION consume_guest_trial(p_session_id uuid, p_nonce uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res_nonce uuid;
  v_res_until timestamptz;
  v_used boolean;
BEGIN
  SELECT trial_reservation_nonce, trial_reserved_until, trial_used
    INTO v_res_nonce, v_res_until, v_used
  FROM guest_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_used THEN
    RETURN TRUE; -- Already consumed → idempotent success.
  END IF;

  IF v_res_nonce IS DISTINCT FROM p_nonce THEN
    RETURN FALSE;
  END IF;

  IF v_res_until IS NULL OR v_res_until <= now() THEN
    -- Reservation timed out.  The caller should re-reserve.
    RETURN FALSE;
  END IF;

  UPDATE guest_sessions
  SET
    trial_used = true,
    trial_used_at = now(),
    trial_reserved_until = NULL,
    trial_reservation_nonce = NULL
  WHERE id = p_session_id;

  RETURN TRUE;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- link_guest_session_to_user(session_id, user_id)
--
-- Called right after signup.  Attaches the anonymous guest session to
-- the newly created account so that:
--   a) trial_used is carried over (user doesn't earn a second free
--      conversion just by signing up).
--   b) if the user account already has a linked guest session, don't
--      overwrite the "consumed" bit of an earlier one.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION link_guest_session_to_user(p_session_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_linked uuid;
  v_already_used boolean;
  v_existing_used boolean;
BEGIN
  SELECT linked_user_id, trial_used
    INTO v_current_linked, v_already_used
  FROM guest_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_current_linked IS NOT NULL THEN
    -- Already linked.  Idempotent no-op.
    RETURN;
  END IF;

  -- Check if there are any existing linked sessions for this user.
  SELECT bool_or(trial_used) INTO v_existing_used
  FROM guest_sessions
  WHERE linked_user_id = p_user_id;

  -- If any earlier linked session already had the trial used, mark
  -- THIS session as trial_used too (carry-over) so the combined state
  -- is "no more free trials".
  IF v_existing_used AND NOT v_already_used THEN
    UPDATE guest_sessions
    SET
      trial_used = true,
      trial_used_at = COALESCE(trial_used_at, now()),
      linked_user_conversions_locked = true
    WHERE id = p_session_id;
  END IF;

  -- Also, mirror the guest's trial_used bit into user_usage if the user
  -- hasn't completed a conversion yet.  This prevents the signup-flow
  -- from resetting the trial.
  IF v_already_used THEN
    INSERT INTO user_usage(user_id, conversions_used, plan, paid_credits, updated_at)
    VALUES (p_user_id, 1, 'free', 0, now())
    ON CONFLICT (user_id) DO UPDATE
      SET
        conversions_used = GREATEST(
          COALESCE(user_usage.conversions_used, 0),
          1
        ),
        updated_at = now()
    WHERE
      COALESCE(user_usage.conversions_used, 0) < 1;
  END IF;

  UPDATE guest_sessions
  SET
    linked_user_id = p_user_id,
    linked_at = now()
  WHERE id = p_session_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- Attribution columns: guest_session_id FK across token_usage
-- ────────────────────────────────────────────────────────────
ALTER TABLE token_usage
  ADD COLUMN IF NOT EXISTS guest_session_id uuid REFERENCES guest_sessions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_token_usage_guest_session
  ON token_usage(guest_session_id) WHERE guest_session_id IS NOT NULL;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS guest_session_id uuid REFERENCES guest_sessions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_guest_session
  ON payments(guest_session_id) WHERE guest_session_id IS NOT NULL;
