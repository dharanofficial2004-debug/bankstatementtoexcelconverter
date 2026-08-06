-- ============================================================
-- Migration 004: user_usage extra columns
-- Adds profession, plan and paid credits for the INR plans
-- (Lifetime ₹59 / Pay-per-conversion ₹19)
-- ============================================================

ALTER TABLE user_usage
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS paid_credits integer NOT NULL DEFAULT 0;

-- Constraint: plan must be one of the known values
ALTER TABLE user_usage
  DROP CONSTRAINT IF EXISTS user_usage_plan_check;

ALTER TABLE user_usage
  ADD CONSTRAINT user_usage_plan_check
  CHECK (plan IN ('free', 'lifetime', 'payg'));

-- Payments: record which plan a payment belongs to
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS plan text;

-- ============================================================
-- Existing-data trigger:
-- Any user who already has a user_usage row has already used the
-- app (and their free conversion) under the old system. Mark them
-- as used so the payment gate triggers on their next upload.
-- (New users signing up after this migration are unaffected — they
--  get a row only once they start converting, with 0 = free left.)
-- ============================================================
UPDATE user_usage
SET conversions_used = GREATEST(conversions_used, 1)
WHERE conversions_used = 0;


