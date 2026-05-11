-- ============================================================================
-- Migration: Fix Credits System Bugs
-- Purpose: Fix critical bugs in credit management system
-- ============================================================================

-- Fix #1: Update increment_usage_counter to check if usage record exists
DROP FUNCTION IF EXISTS public.increment_usage_counter(UUID, TEXT, INTEGER) CASCADE;

CREATE FUNCTION public.increment_usage_counter(
  p_subscription_id UUID,
  p_counter_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_type TEXT;
  v_current_period_start TIMESTAMPTZ;
  v_current_period_end TIMESTAMPTZ;
  v_videos_limit INTEGER;
  v_profiles_limit INTEGER;
  v_videos_posted INTEGER;
  v_profiles_viewed INTEGER;
  v_videos_remaining INTEGER;
  v_profiles_remaining INTEGER;
  v_is_unlimited BOOLEAN;
  v_result JSON;
BEGIN
  -- Get subscription info
  SELECT id, plan_type
  INTO v_subscription_id, v_plan_type
  FROM public.subscriptions
  WHERE id = p_subscription_id;

  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;

  -- Get current period usage
  SELECT period_start, period_end, videos_posted, profiles_viewed, videos_remaining, profiles_remaining
  INTO v_current_period_start, v_current_period_end, v_videos_posted, v_profiles_viewed, v_videos_remaining, v_profiles_remaining
  FROM public.subscription_usage
  WHERE subscription_id = p_subscription_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if usage record exists
  IF v_current_period_start IS NULL THEN
    RAISE EXCEPTION 'Usage record not found for subscription. Please ensure subscription_usage is initialized.';
  END IF;

  -- Handle different counter types
  CASE p_counter_type
    WHEN 'videos_posted' THEN
      v_is_unlimited := (v_videos_remaining IS NULL);

      IF NOT v_is_unlimited AND v_videos_remaining < p_increment THEN
        RAISE EXCEPTION 'Videos posted limit reached for this period';
      END IF;

      UPDATE public.subscription_usage
      SET videos_posted = videos_posted + p_increment
      WHERE subscription_id = p_subscription_id
        AND period_start = v_current_period_start
        AND period_end = v_current_period_end;

    WHEN 'profiles_viewed' THEN
      v_is_unlimited := (v_profiles_remaining IS NULL);

      IF NOT v_is_unlimited AND v_profiles_remaining < p_increment THEN
        RAISE EXCEPTION 'Profiles view limit reached for this period';
      END IF;

      UPDATE public.subscription_usage
      SET profiles_viewed = profiles_viewed + p_increment,
          profiles_remaining = CASE
            WHEN v_profiles_remaining IS NOT NULL THEN
              GREATEST(0, v_profiles_remaining - p_increment)
            ELSE NULL
          END
      WHERE subscription_id = p_subscription_id
        AND period_start = v_current_period_start
        AND period_end = v_current_period_end;

    WHEN 'messages_sent' THEN
      UPDATE public.subscription_usage
      SET messages_sent = messages_sent + p_increment
      WHERE subscription_id = p_subscription_id
        AND period_start = v_current_period_start
        AND period_end = v_current_period_end;

    WHEN 'matches_made' THEN
      UPDATE public.subscription_usage
      SET matches_made = matches_made + p_increment
      WHERE subscription_id = p_subscription_id
        AND period_start = v_current_period_start
        AND period_end = v_current_period_end;

    ELSE
      RAISE EXCEPTION 'Invalid counter type: %', p_counter_type;
  END CASE;

  -- Return updated usage
  SELECT json_build_object(
    'counter_type', p_counter_type,
    'incremented', p_increment,
    'videos_posted', (SELECT videos_posted FROM public.subscription_usage WHERE subscription_id = p_subscription_id AND period_start = v_current_period_start LIMIT 1),
    'profiles_viewed', (SELECT profiles_viewed FROM public.subscription_usage WHERE subscription_id = p_subscription_id AND period_start = v_current_period_start LIMIT 1)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_usage_counter(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage_counter(UUID, TEXT, INTEGER) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.increment_usage_counter(UUID, TEXT, INTEGER) IS 'Increments usage counters and checks limits. Now includes check for existing usage record.';
