-- ============================================================================
-- Unlocked Candidates Table & RPC Functions
-- Purpose: Track permanently unlocked candidates for companies with credits
-- Migration: 024_create_unlocked_candidates_table.sql
-- ============================================================================

-- Create unlocked_candidates table
CREATE TABLE IF NOT EXISTS public.unlocked_candidates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  unlocked_at timestamptz DEFAULT now() NOT NULL,
  credits_used integer DEFAULT 1 NOT NULL CHECK (credits_used > 0),

  -- Ensure a company can only unlock a candidate once
  UNIQUE(company_id, candidate_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unlocked_candidates_company_id ON public.unlocked_candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_candidates_candidate_id ON public.unlocked_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_candidates_subscription_id ON public.unlocked_candidates(subscription_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_candidates_unlocked_at ON public.unlocked_candidates(unlocked_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.unlocked_candidates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Companies can view own unlocked candidates" ON public.unlocked_candidates;
DROP POLICY IF EXISTS "Companies can insert own unlocked candidates" ON public.unlocked_candidates;
DROP POLICY IF EXISTS "Admins can view all unlocked candidates" ON public.unlocked_candidates;

-- Policy: Companies can view their own unlocked candidates
CREATE POLICY "Companies can view own unlocked candidates" ON public.unlocked_candidates
  FOR SELECT USING (auth.uid() = company_id);

-- Policy: Companies can insert their own unlocked candidates
CREATE POLICY "Companies can insert own unlocked candidates" ON public.unlocked_candidates
  FOR INSERT WITH CHECK (auth.uid() = company_id);

-- Policy: Admins can view all unlocked candidates
CREATE POLICY "Admins can view all unlocked candidates" ON public.unlocked_candidates
  FOR SELECT USING (is_admin(auth.uid()));

-- Add comments for documentation
COMMENT ON TABLE public.unlocked_candidates IS 'Tracks candidates permanently unlocked by companies using credits';
COMMENT ON COLUMN public.unlocked_candidates.company_id IS 'The company (profile) that unlocked the candidate';
COMMENT ON COLUMN public.unlocked_candidates.candidate_id IS 'The candidate that was unlocked';
COMMENT ON COLUMN public.unlocked_candidates.subscription_id IS 'The subscription used to unlock (may be null if subscription was deleted)';
COMMENT ON COLUMN public.unlocked_candidates.unlocked_at IS 'When the candidate was unlocked';
COMMENT ON COLUMN public.unlocked_candidates.credits_used IS 'Number of credits used (typically 1)';

-- ============================================================================
-- RPC Function: get_unlocked_candidates
-- Returns the list of candidate IDs already unlocked by a company
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_unlocked_candidates(
  p_company_id uuid,
  p_candidate_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  candidate_id uuid,
  unlocked_at timestamptz,
  credits_used integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.candidate_id,
    uc.unlocked_at,
    uc.credits_used
  FROM public.unlocked_candidates uc
  WHERE uc.company_id = p_company_id
    AND (p_candidate_ids IS NULL OR uc.candidate_id = ANY(p_candidate_ids))
  ORDER BY uc.unlocked_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_unlocked_candidates(uuid, uuid[]) TO authenticated;

COMMENT ON FUNCTION public.get_unlocked_candidates IS 'Returns candidates unlocked by a company. Optionally filter by specific candidate IDs.';

-- ============================================================================
-- RPC Function: unlock_candidate
-- Unlocks a candidate by incrementing usage and recording the unlock
-- ============================================================================
CREATE OR REPLACE FUNCTION public.unlock_candidate(
  p_company_id uuid,
  p_candidate_id uuid,
  p_subscription_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_unlock uuid;
  v_remaining_profiles integer;
  v_is_unlimited boolean;
  v_plan_type text;
BEGIN
  -- Check if already unlocked
  SELECT id INTO v_existing_unlock
  FROM public.unlocked_candidates
  WHERE company_id = p_company_id AND candidate_id = p_candidate_id;

  IF v_existing_unlock IS NOT NULL THEN
    -- Already unlocked, return success without charging credits
    RETURN jsonb_build_object(
      'success', true,
      'already_unlocked', true,
      'message', 'Candidate already unlocked'
    );
  END IF;

  -- Get subscription plan type and check remaining credits
  SELECT s.plan_type INTO v_plan_type
  FROM public.subscriptions s
  WHERE s.id = p_subscription_id AND s.status = 'active' AND s.user_id = p_company_id;

  IF v_plan_type IS NULL THEN
    RAISE EXCEPTION 'No active subscription found';
  END IF;

  -- Check if plan is unlimited (hero)
  v_is_unlimited := (v_plan_type = 'hero');

  IF NOT v_is_unlimited THEN
    -- Get remaining profiles from subscription_usage
    SELECT profiles_remaining INTO v_remaining_profiles
    FROM public.subscription_usage
    WHERE subscription_id = p_subscription_id
      AND period_start = (SELECT current_period_start FROM public.subscriptions WHERE id = p_subscription_id)
      AND period_end = (SELECT current_period_end FROM public.subscriptions WHERE id = p_subscription_id);

    -- Check if has remaining credits
    IF v_remaining_profiles IS NOT NULL AND v_remaining_profiles <= 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'no_credits',
        'message', 'No credits remaining for this period'
      );
    END IF;
  END IF;

  -- Increment usage counter (will raise exception if no credits)
  PERFORM public.increment_usage_counter(p_subscription_id, 'profiles_viewed', 1);

  -- Record the unlock
  INSERT INTO public.unlocked_candidates (
    company_id,
    candidate_id,
    subscription_id,
    credits_used
  ) VALUES (
    p_company_id,
    p_candidate_id,
    p_subscription_id,
    1
  );

  -- Get updated remaining count
  IF NOT v_is_unlimited THEN
    SELECT profiles_remaining INTO v_remaining_profiles
    FROM public.subscription_usage
    WHERE subscription_id = p_subscription_id
      AND period_start = (SELECT current_period_start FROM public.subscriptions WHERE id = p_subscription_id)
      AND period_end = (SELECT current_period_end FROM public.subscriptions WHERE id = p_subscription_id);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'already_unlocked', false,
    'plan_type', v_plan_type,
    'is_unlimited', v_is_unlimited,
    'remaining', v_remaining_profiles,
    'message', 'Candidate unlocked successfully'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.unlock_candidate(uuid, uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.unlock_candidate IS 'Unlocks a candidate profile by consuming 1 credit. Returns jsonb with success status and remaining credits.';

-- ============================================================================
-- RPC Function: get_company_credits_info
-- Returns detailed credits information for a company
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_company_credits_info(
  p_company_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id uuid;
  v_plan_type text;
  v_status text;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_profiles_viewed integer;
  v_profiles_remaining integer;
  v_total_unlocked bigint;
BEGIN
  -- Get active subscription
  SELECT id, plan_type, status, current_period_start, current_period_end
  INTO v_subscription_id, v_plan_type, v_status, v_period_start, v_period_end
  FROM public.subscriptions
  WHERE user_id = p_company_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_subscription_id IS NULL THEN
    -- No active subscription
    RETURN jsonb_build_object(
      'has_subscription', false,
      'is_unlimited', false,
      'remaining', 0,
      'viewed', 0,
      'plan_type', null
    );
  END IF;

  -- Get usage data
  SELECT profiles_viewed, profiles_remaining
  INTO v_profiles_viewed, v_profiles_remaining
  FROM public.subscription_usage
  WHERE subscription_id = v_subscription_id
    AND period_start = v_period_start
    AND period_end = v_period_end;

  -- Handle NULL profiles_remaining (unlimited plan)
  IF v_profiles_remaining IS NULL THEN
    v_profiles_remaining := 999999; -- Large number for UI
  END IF;

  IF v_profiles_viewed IS NULL THEN
    v_profiles_viewed := 0;
  END IF;

  -- Count total permanently unlocked candidates
  SELECT COUNT(*) INTO v_total_unlocked
  FROM public.unlocked_candidates
  WHERE company_id = p_company_id;

  RETURN jsonb_build_object(
    'has_subscription', true,
    'is_unlimited', (v_plan_type = 'hero'),
    'remaining', v_profiles_remaining,
    'viewed', v_profiles_viewed,
    'total_unlocked', v_total_unlocked,
    'plan_type', v_plan_type,
    'period_start', v_period_start,
    'period_end', v_period_end
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_company_credits_info(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_company_credits_info IS 'Returns detailed credits information for a company including remaining, viewed, and plan type.';

-- ============================================================================
-- RPC Function: check_candidate_unlocked
-- Check if a specific candidate is unlocked for a company
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_candidate_unlocked(
  p_company_id uuid,
  p_candidate_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.unlocked_candidates
    WHERE company_id = p_company_id AND candidate_id = p_candidate_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_candidate_unlocked(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.check_candidate_unlocked IS 'Returns true if the candidate has been unlocked by the company, false otherwise.';
