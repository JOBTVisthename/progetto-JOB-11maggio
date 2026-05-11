-- ============================================================================
-- Migration 022: Fix RLS Policies for Company Search and Add Search Fields
-- ============================================================================
-- This migration fixes the issue where companies cannot search candidates
-- and adds new fields for better candidate filtering

-- ============================================================================
-- STEP 1: Add new columns to candidate_profiles for enhanced search
-- ============================================================================

-- Add experience and contract type fields
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
  ADD COLUMN IF NOT EXISTS contract_type_preference TEXT CHECK (contract_type_preference IN ('full-time', 'part-time', 'contract', 'freelance', 'any'));

-- Add location fields (already used in search but missing from schema)
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Italia',
  ADD COLUMN IF NOT EXISTS remote_availability BOOLEAN DEFAULT false;

-- Add skills and education
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS skills TEXT[], -- Array of skills: ['JavaScript', 'React', 'Node.js']
  ADD COLUMN IF NOT EXISTS languages TEXT[], -- Array of languages: ['Italiano', 'Inglese']
  ADD COLUMN IF NOT EXISTS education_level TEXT CHECK (education_level IN ('high-school', 'bachelor', 'master', 'phd', 'other', 'none'));

-- Add salary expectations
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS salary_expectation_min INTEGER,
  ADD COLUMN IF NOT EXISTS salary_expectation_max INTEGER;

-- Add job search duration
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS job_search_duration TEXT CHECK (job_search_duration IN ('active', 'passive', 'not-looking'));

-- Add willing_to_change_region (for relocation flexibility)
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS willing_to_change_region BOOLEAN DEFAULT false;

-- ============================================================================
-- STEP 2: Fix RLS Policies - Allow companies to read candidate profiles
-- ============================================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own candidate profile" ON public.candidate_profiles;

-- Create new policies:
-- 1. Authenticated users (including companies) can read all candidate profiles
CREATE POLICY "Authenticated users can view candidate profiles"
  ON public.candidate_profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. Candidates can only update their own profile
CREATE POLICY "Candidates can update own profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Insert is allowed during registration
CREATE POLICY "Users can insert candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 3: Update profiles table policies
-- ============================================================================

-- Allow authenticated to read profiles (needed to check user type)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 4: Add helpful indexes for search performance
-- ============================================================================

-- Index on commonly searched fields
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_desired_job_title ON public.candidate_profiles USING gin(desired_job_title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_city ON public.candidate_profiles USING gin(city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_province ON public.candidate_profiles USING gin(province gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_country ON public.candidate_profiles USING gin(country gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_skills ON public.candidate_profiles USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_languages ON public.candidate_profiles USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_contract_type ON public.candidate_profiles(contract_type_preference);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_years_experience ON public.candidate_profiles(years_of_experience);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_education_level ON public.candidate_profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_availability_date ON public.candidate_profiles(available_start_date);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_remote ON public.candidate_profiles(remote_availability);

-- Composite index for location search
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_location_search ON public.candidate_profiles(city, province, country);

-- ============================================================================
-- STEP 5: Enable pg_trgm extension for text search (if not already enabled)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- STEP 6: Grant permissions
-- ============================================================================
GRANT SELECT ON public.candidate_profiles TO authenticated;
GRANT SELECT ON public.candidate_profiles TO anon;
GRANT UPDATE ON public.candidate_profiles TO authenticated;
GRANT INSERT ON public.candidate_profiles TO authenticated;

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
