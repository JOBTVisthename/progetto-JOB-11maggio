-- ============================================================================
-- Payment Records Table
-- Purpose: Track all payment transactions, one-time payments, and invoices
-- Migration: 004_create_payment_records_table.sql
-- ============================================================================

-- Create payment_records table
CREATE TABLE IF NOT EXISTS public.payment_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE,
  stripe_invoice_id text UNIQUE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'partial_refund')),
  payment_type text NOT NULL CHECK (payment_type IN ('subscription', 'one_time', 'trial')),

  -- For subscription payments
  period_start timestamptz,
  period_end timestamptz,

  -- Metadata
  description text,
  metadata jsonb DEFAULT '{}',

  -- Refund info
  refunded_amount decimal(10,2) DEFAULT 0,
  refund_reason text,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_subscription_id ON public.payment_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON public.payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_type ON public.payment_records(payment_type);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON public.payment_records(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own payment records
CREATE POLICY "Users can view own payment records" ON public.payment_records
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert own payment records (for system use)
CREATE POLICY "Users can insert own payment records" ON public.payment_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all payment records
CREATE POLICY "Admins can view all payment records" ON public.payment_records
  FOR SELECT USING (is_admin(auth.uid()));

-- Policy: Admins can insert payment records
CREATE POLICY "Admins can insert payment records" ON public.payment_records
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Policy: Admins can update payment records
CREATE POLICY "Admins can update payment records" ON public.payment_records
  FOR UPDATE USING (is_admin(auth.uid()));

-- Policy: Admins can delete payment records
CREATE POLICY "Admins can delete payment records" ON public.payment_records
  FOR DELETE USING (is_admin(auth.uid()));

-- Add comments for documentation
COMMENT ON TABLE public.payment_records IS 'Tracks all payment transactions including subscriptions, one-time payments, and invoices';
COMMENT ON COLUMN public.payment_records.stripe_payment_intent_id IS 'Stripe Payment Intent ID for this transaction';
COMMENT ON COLUMN public.payment_records.stripe_invoice_id IS 'Stripe Invoice ID (for subscription billing)';
COMMENT ON COLUMN public.payment_records.subscription_id IS 'Related subscription (if applicable)';
COMMENT ON COLUMN public.payment_records.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN public.payment_records.status IS 'Payment status: pending, succeeded, failed, refunded, partial_refund';
COMMENT ON COLUMN public.payment_records.payment_type IS 'Type of payment: subscription, one_time, trial';
COMMENT ON COLUMN public.payment_records.period_start IS 'Subscription period start date (for recurring payments)';
COMMENT ON COLUMN public.payment_records.period_end IS 'Subscription period end date (for recurring payments)';
COMMENT ON COLUMN public.payment_records.refunded_amount IS 'Amount refunded (if applicable)';
COMMENT ON COLUMN public.payment_records.refund_reason IS 'Reason for refund (if applicable)';
