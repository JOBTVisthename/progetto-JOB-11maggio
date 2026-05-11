-- ============================================================================
-- Subscription Usage Table
-- Purpose: Track usage-based metrics for each subscription period
-- Migration: 006_create_subscription_usage_table.sql
-- ============================================================================

-- Create subscription_usage table
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,

  -- Usage metrics
  videos_posted integer DEFAULT 0,
  videos_remaining integer,
  profiles_viewed integer DEFAULT 0,
  profiles_remaining integer,
  messages_sent integer DEFAULT 0,
  matches_made integer DEFAULT 0,

  -- Plan limits for reference
  plan_type text NOT NULL CHECK (plan_type IN ('starter', 'builder', 'hero')),

  -- Metadata
  metadata jsonb DEFAULT '{}',

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Ensure one record per subscription per period
  UNIQUE(subscription_id, period_start, period_end)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON public.subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON public.subscription_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_plan_type ON public.subscription_usage(plan_type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own subscription usage
CREATE POLICY "Users can view own subscription usage" ON public.subscription_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_usage.subscription_id
      AND s.user_id = auth.uid()
    )
  );

-- Policy: System can insert usage records (via service role)
CREATE POLICY "System can insert subscription usage" ON public.subscription_usage
  FOR INSERT WITH CHECK (true);

-- Policy: System can update usage records (via service role)
CREATE POLICY "System can update subscription usage" ON public.subscription_usage
  FOR UPDATE USING (true);

-- Policy: Admins can view all subscription usage
CREATE POLICY "Admins can view all subscription usage" ON public.subscription_usage
  FOR SELECT USING (is_admin(auth.uid()));

-- Function to initialize usage for a new subscription period
CREATE OR REPLACE FUNCTION public.initialize_subscription_usage(
  p_subscription_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_plan_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usage_id uuid;
  v_videos_limit integer;
  v_profiles_limit integer;
BEGIN
  -- Set limits based on plan type
  CASE p_plan_type
    WHEN 'starter' THEN
      v_videos_limit := 1;
      v_profiles_limit := 20;
    WHEN 'builder' THEN
      v_videos_limit := 3;
      v_profiles_limit := 150;
    WHEN 'hero' THEN
      v_videos_limit := NULL; -- unlimited
      v_profiles_limit := NULL; -- unlimited
    ELSE
      v_videos_limit := 1;
      v_profiles_limit := 20;
  END CASE;

  -- Insert new usage record
  INSERT INTO public.subscription_usage (
    subscription_id,
    period_start,
    period_end,
    videos_posted,
    videos_remaining,
    profiles_viewed,
    profiles_remaining,
    messages_sent,
    matches_made,
    plan_type
  ) VALUES (
    p_subscription_id,
    p_period_start,
    p_period_end,
    0,
    v_videos_limit,
    0,
    v_profiles_limit,
    0,
    0,
    p_plan_type
  )
  ON CONFLICT (subscription_id, period_start, period_end)
  DO NOTHING
  RETURNING id INTO v_usage_id;

  -- If on conflict, get existing record
  IF v_usage_id IS NULL THEN
    SELECT id INTO v_usage_id
    FROM public.subscription_usage
    WHERE subscription_id = p_subscription_id
    AND period_start = p_period_start
    AND period_end = p_period_end;
  END IF;

  RETURN v_usage_id;
END;
$$;

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION public.increment_usage_counter(
  p_subscription_id uuid,
  p_counter_type text,
  p_increment integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_period_start timestamptz;
  v_current_period_end timestamptz;
  v_remaining integer;
  v_is_unlimited boolean;
BEGIN
  -- Get current subscription period
  SELECT current_period_start, current_period_end
  INTO v_current_period_start, v_current_period_end
  FROM public.subscriptions
  WHERE id = p_subscription_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found or not active';
  END IF;

  -- Check if counter is available
  CASE p_counter_type
    WHEN 'videos_posted' THEN
      SELECT videos_remaining INTO v_remaining
      FROM public.subscription_usage
      WHERE subscription_id = p_subscription_id
      AND period_start = v_current_period_start
      AND period_end = v_current_period_end;

      v_is_unlimited := (v_remaining IS NULL);

      IF NOT v_is_unlimited AND v_remaining <= 0 THEN
        RAISE EXCEPTION 'Videos limit reached for this period';
      END IF;

      -- Update counter
      UPDATE public.subscription_usage
      SET
        videos_posted = videos_posted + p_increment,
        videos_remaining = CASE WHEN videos_remaining IS NOT NULL THEN videos_remaining - p_increment ELSE NULL END,
        updated_at = now()
      WHERE subscription_id = p_subscription_id
      AND period_start = v_current_period_start
      AND period_end = v_current_period_end;

    WHEN 'profiles_viewed' THEN
      SELECT profiles_remaining INTO v_remaining
      FROM public.subscription_usage
      WHERE subscription_id = p_subscription_id
      AND period_start = v_current_period_start
      AND period_end = v_current_period_end;

      v_is_unlimited := (v_remaining IS NULL);

      IF NOT v_is_unlimited AND v_remaining <= 0 THEN
        RAISE EXCEPTION 'Profiles view limit reached for this period';
      END IF;

      -- Update counter
      UPDATE public.subscription_usage
      SET
        profiles_viewed = profiles_viewed + p_increment,
        profiles_remaining = CASE WHEN profiles_remaining IS NOT NULL THEN profiles_remaining - p_increment ELSE NULL END,
        updated_at = now()
      WHERE subscription_id = p_subscription_id
      AND period_start = v_current_period_start
      AND period_end = v_current_period_end;

    WHEN 'messages_sent' THEN
      UPDATE public.subscription_usage
      SET
        messages_sent = messages_sent + p_increment,
        updated_at = now()
      WHERE subscription_id = p_subscription_id
      AND period_start = v_current_period_start
      AND period_end = v_current_period_end;

    WHEN 'matches_made' THEN
      UPDATE public.subscription_usage
      SET
        matches_made = matches_made + p_increment,
        updated_at = now()
      WHERE subscription_id = p_subscription_id
      AND period_start = v_current_period_start
      AND period_end = v_current_period_end;

    ELSE
      RAISE EXCEPTION 'Invalid counter type: %', p_counter_type;
  END CASE;

  RETURN true;
END;
$$;

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_subscription_usage_updated_at
  BEFORE UPDATE ON public.subscription_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.subscription_usage IS 'Tracks usage metrics for each subscription billing period';
COMMENT ON COLUMN public.subscription_usage.videos_posted IS 'Number of videos posted in current period';
COMMENT ON COLUMN public.subscription_usage.videos_remaining IS 'Remaining video posts (null = unlimited)';
COMMENT ON COLUMN public.subscription_usage.profiles_viewed IS 'Number of candidate profiles viewed in current period';
COMMENT ON COLUMN public.subscription_usage.profiles_remaining IS 'Remaining profile views (null = unlimited)';
COMMENT ON COLUMN public.subscription_usage.messages_sent IS 'Number of messages sent in current period';
COMMENT ON COLUMN public.subscription_usage.matches_made IS 'Number of matches made in current period';
COMMENT ON COLUMN public.subscription_usage.plan_type IS 'Plan type for reference (starter, builder, hero)';
COMMENT ON FUNCTION public.initialize_subscription_usage IS 'Initialize usage tracking for a new subscription period';
COMMENT ON FUNCTION public.increment_usage_counter IS 'Increment a usage counter and check limits';
