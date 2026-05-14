-- ============================================================================
-- Create job_offers table for company job postings with AI-generated skills
-- ============================================================================

-- Create job_offers table
CREATE TABLE IF NOT EXISTS public.job_offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  hard_skills text[], -- Array of required hard skills
  soft_skills text[], -- Array of required soft skills
  location text,
  salary_range text,
  employment_type text DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
  experience_level text DEFAULT 'entry' CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_offers_company_id ON public.job_offers(company_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_is_active ON public.job_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_job_offers_created_at ON public.job_offers(created_at);
CREATE INDEX IF NOT EXISTS idx_job_offers_employment_type ON public.job_offers(employment_type);
CREATE INDEX IF NOT EXISTS idx_job_offers_experience_level ON public.job_offers(experience_level);

-- Enable RLS
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Companies can view own job offers"
  ON public.job_offers FOR SELECT
  USING (auth.uid() = company_id);

CREATE POLICY "Companies can insert own job offers"
  ON public.job_offers FOR INSERT
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update own job offers"
  ON public.job_offers FOR UPDATE
  USING (auth.uid() = company_id);

CREATE POLICY "Companies can delete own job offers"
  ON public.job_offers FOR DELETE
  USING (auth.uid() = company_id);

-- Create policy for candidates to view active job offers (for matching)
CREATE POLICY "Candidates can view active job offers"
  ON public.job_offers FOR SELECT
  USING (is_active = true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_job_offers_updated_at
  BEFORE UPDATE ON public.job_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_job_offers_updated_at();