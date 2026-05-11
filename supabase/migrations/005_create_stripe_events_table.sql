-- ============================================================================
-- Stripe Events Log Table
-- Purpose: Log all Stripe webhook events for debugging and audit
-- Migration: 005_create_stripe_events_table.sql
-- ============================================================================

-- Create stripe_events table
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed boolean DEFAULT false,
  processing_error text,

  -- Event data (full JSON)
  event_data jsonb NOT NULL,

  -- Related entities (optional, populated during processing)
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_record_id uuid REFERENCES public.payment_records(id) ON DELETE SET NULL,

  -- Timestamps
  received_at timestamptz DEFAULT now() NOT NULL,
  processed_at timestamptz
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_events_stripe_event_id ON public.stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_type ON public.stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON public.stripe_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_events_received_at ON public.stripe_events(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_events_user_id ON public.stripe_events(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_subscription_id ON public.stripe_events(subscription_id);

-- Enable RLS (Row Level Security) - Admins only for this table
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all stripe events
CREATE POLICY "Admins can view all stripe events" ON public.stripe_events
  FOR SELECT USING (is_admin(auth.uid()));

-- Policy: Admins can insert stripe events
CREATE POLICY "Admins can insert stripe events" ON public.stripe_events
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Policy: Admins can update stripe events
CREATE POLICY "Admins can update stripe events" ON public.stripe_events
  FOR UPDATE USING (is_admin(auth.uid()));

-- Policy: Admins can delete stripe events
CREATE POLICY "Admins can delete stripe events" ON public.stripe_events
  FOR DELETE USING (is_admin(auth.uid()));

-- Create function to check if a stripe event has already been processed
CREATE OR REPLACE FUNCTION public.is_stripe_event_processed(p_stripe_event_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.stripe_events
    WHERE stripe_event_id = p_stripe_event_id
    AND processed = true
  );
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE public.stripe_events IS 'Audit log of all Stripe webhook events received';
COMMENT ON COLUMN public.stripe_events.stripe_event_id IS 'Unique event ID from Stripe';
COMMENT ON COLUMN public.stripe_events.event_type IS 'Stripe event type (e.g., invoice.paid, customer.subscription.updated)';
COMMENT ON COLUMN public.stripe_events.processed IS 'Whether the event has been successfully processed';
COMMENT ON COLUMN public.stripe_events.processing_error IS 'Error message if processing failed';
COMMENT ON COLUMN public.stripe_events.event_data IS 'Full event payload from Stripe';
COMMENT ON COLUMN public.stripe_events.received_at IS 'When the webhook was received';
COMMENT ON COLUMN public.stripe_events.processed_at IS 'When the event was processed (null if not processed)';
