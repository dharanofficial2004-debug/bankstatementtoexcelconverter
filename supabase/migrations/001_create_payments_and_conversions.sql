-- ============================================================
-- Migration: Create payments and conversions tables
-- Pay As You Go system for Bank Statement to Excel Converter
-- ============================================================

-- ============================================================
-- Table: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  pages integer NOT NULL DEFAULT 0,
  words integer NOT NULL DEFAULT 0,
  characters integer NOT NULL DEFAULT 0,
  size_score integer NOT NULL DEFAULT 0,
  document_size text NOT NULL DEFAULT 'Unknown',
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'USD',
  payment_status text NOT NULL DEFAULT 'created',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payments"
  ON payments
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Table: conversions
-- ============================================================
CREATE TABLE IF NOT EXISTS conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  pages integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  excel_download_url text,
  csv_download_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for conversions
CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversions_payment_id ON conversions(payment_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at DESC);

-- Enable RLS on conversions
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversions
CREATE POLICY "Users can view their own conversions"
  ON conversions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversions"
  ON conversions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all conversions"
  ON conversions
  FOR ALL
  USING (auth.role() = 'service_role');
