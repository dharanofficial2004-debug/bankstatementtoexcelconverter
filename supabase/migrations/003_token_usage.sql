-- ============================================================
-- Migration 003: token_usage table
-- Tracks OpenAI API input/output tokens per user per call,
-- similar to how ChatGPT shows token consumption.
-- ============================================================

CREATE TABLE IF NOT EXISTS token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- null when called by an anonymous/unauthenticated user
  model text NOT NULL DEFAULT 'gpt-4.1-mini',
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  filename text,
  pages integer,
  -- cost estimates (USD) based on gpt-4.1-mini pricing at time of writing
  -- input: $0.40 / 1M tokens  output: $1.60 / 1M tokens
  estimated_input_cost_usd numeric(12, 8) GENERATED ALWAYS AS (input_tokens * 0.0000004) STORED,
  estimated_output_cost_usd numeric(12, 8) GENERATED ALWAYS AS (output_tokens * 0.0000016) STORED,
  estimated_total_cost_usd numeric(12, 8) GENERATED ALWAYS AS ((input_tokens * 0.0000004) + (output_tokens * 0.0000016)) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at DESC);

-- Enable RLS
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own token usage
CREATE POLICY "Users can view own token usage"
  ON token_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access (used by server-side API routes)
CREATE POLICY "Service role manages all token usage"
  ON token_usage FOR ALL
  USING (auth.role() = 'service_role');
