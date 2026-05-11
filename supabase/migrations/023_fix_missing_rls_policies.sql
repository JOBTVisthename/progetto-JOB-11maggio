-- ============================================================================
-- Migration 023: Fix Missing RLS Policies
-- ============================================================================
-- This migration adds RLS policies for tables that were missing them

-- ============================================================================
-- STEP 1: Create RLS policies for video_interviews
-- ============================================================================

-- Authenticated users (including companies) can read all video interviews
CREATE POLICY IF NOT EXISTS "Authenticated users can view video interviews"
  ON public.video_interviews FOR SELECT
  TO authenticated
  USING (true);

-- Candidates can insert their own video interviews
CREATE POLICY IF NOT EXISTS "Candidates can insert own video interviews"
  ON public.video_interviews FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

-- Candidates can update their own video interviews
CREATE POLICY IF NOT EXISTS "Candidates can update own video interviews"
  ON public.video_interviews FOR UPDATE
  USING (auth.uid() = candidate_id);

-- Candidates can delete their own video interviews
CREATE POLICY IF NOT EXISTS "Candidates can delete own video interviews"
  ON public.video_interviews FOR DELETE
  USING (auth.uid() = candidate_id);

-- ============================================================================
-- STEP 2: Create RLS policies for job_matching
-- ============================================================================

-- Authenticated users can read job_matching records
CREATE POLICY IF NOT EXISTS "Authenticated users can view job_matching"
  ON public.job_matching FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert job_matching records
CREATE POLICY IF NOT EXISTS "Users can insert job_matching"
  ON public.job_matching FOR INSERT
  WITH CHECK (true);

-- Users can update job_matching if they are involved (company or candidate)
CREATE POLICY IF NOT EXISTS "Users can update own job_matching"
  ON public.job_matching FOR UPDATE
  USING (auth.uid() = company_id OR auth.uid() = candidate_id);

-- ============================================================================
-- STEP 3: Grant permissions
-- ============================================================================

-- video_interviews
GRANT SELECT ON public.video_interviews TO authenticated;
GRANT SELECT ON public.video_interviews TO anon;
GRANT INSERT ON public.video_interviews TO authenticated;
GRANT UPDATE ON public.video_interviews TO authenticated;
GRANT DELETE ON public.video_interviews TO authenticated;

-- job_matching
GRANT SELECT ON public.job_matching TO authenticated;
GRANT SELECT ON public.job_matching TO anon;
GRANT INSERT ON public.job_matching TO authenticated;
GRANT UPDATE ON public.job_matching TO authenticated;
