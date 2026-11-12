CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_subscription_id text NOT NULL UNIQUE,
  razorpay_plan_id text NOT NULL,
  status text NOT NULL DEFAULT 'created',
  current_start timestamptz,
  current_end timestamptz,
  cancel_at_cycle_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_created
  ON user_subscriptions(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_one_nonterminal
  ON user_subscriptions(user_id)
  WHERE status IN ('created', 'authenticated', 'active', 'pending', 'halted', 'paused', 'resumed');

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_subscriptions: service role only" ON user_subscriptions;
CREATE POLICY "user_subscriptions: service role only"
  ON user_subscriptions FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE TABLE IF NOT EXISTS razorpay_subscription_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE razorpay_subscription_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "razorpay_subscription_events: service role only" ON razorpay_subscription_events;
CREATE POLICY "razorpay_subscription_events: service role only"
  ON razorpay_subscription_events FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
