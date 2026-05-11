-- ============================================================================
-- Create job_matching table for candidate-company matching
-- ============================================================================

-- Create job_matching table
CREATE TABLE IF NOT EXISTS public.job_matching (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  candidate_liked boolean DEFAULT false,
  company_liked boolean DEFAULT false,
  match_status text DEFAULT 'pending' CHECK (match_status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  match_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(candidate_id, company_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_matching_candidate_id ON public.job_matching(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_matching_company_id ON public.job_matching(company_id);
CREATE INDEX IF NOT EXISTS idx_job_matching_match_status ON public.job_matching(match_status);
CREATE INDEX IF NOT EXISTS idx_job_matching_match_date ON public.job_matching(match_date);
CREATE INDEX IF NOT EXISTS idx_job_matching_created_at ON public.job_matching(created_at);

-- Enable RLS
ALTER TABLE public.job_matching ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Candidates can view own matches" ON public.job_matching;
DROP POLICY IF EXISTS "Companies can view own matches" ON public.job_matching;
DROP POLICY IF EXISTS "Candidates can insert own matches" ON public.job_matching;
DROP POLICY IF EXISTS "Companies can insert own matches" ON public.job_matching;
DROP POLICY IF EXISTS "Candidates can update own matches" ON public.job_matching;
DROP POLICY IF EXISTS "Companies can update own matches" ON public.job_matching;

-- Create policies for candidates
CREATE POLICY "Candidates can view own matches"
  ON public.job_matching FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can insert own matches"
  ON public.job_matching FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own matches"
  ON public.job_matching FOR UPDATE
  USING (auth.uid() = candidate_id);

-- Create policies for companies
CREATE POLICY "Companies can view own matches"
  ON public.job_matching FOR SELECT
  USING (auth.uid() = company_id);

CREATE POLICY "Companies can insert own matches"
  ON public.job_matching FOR INSERT
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update own matches"
  ON public.job_matching FOR UPDATE
  USING (auth.uid() = company_id);

-- Create messages table for match messaging
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_matching_id uuid NOT NULL REFERENCES public.job_matching(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_job_matching_id ON public.messages(job_matching_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for messages if they exist
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create policies for messages
CREATE POLICY "Users can view messages in their matches"
  ON public.messages FOR SELECT
  USING (
    job_matching_id IN (
      SELECT id FROM public.job_matching
      WHERE candidate_id = auth.uid() OR company_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their matches"
  ON public.messages FOR INSERT
  WITH CHECK (
    job_matching_id IN (
      SELECT id FROM public.job_matching
      WHERE candidate_id = auth.uid() OR company_id = auth.uid()
    ) AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_job_matching_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for job_matching
DROP TRIGGER IF EXISTS update_job_matching_updated_at_trigger ON public.job_matching;
CREATE TRIGGER update_job_matching_updated_at_trigger
  BEFORE UPDATE ON public.job_matching
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_matching_updated_at();

-- Function to auto-set match_date when both parties have liked
CREATE OR REPLACE FUNCTION public.check_match_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if both candidate and company have liked each other
  IF NEW.candidate_liked = true AND NEW.company_liked = true THEN
    -- If match was just created, set the match_date
    IF OLD.match_status IS DISTINCT FROM 'accepted' THEN
      NEW.match_status := 'accepted';
      NEW.match_date := COALESCE(NEW.match_date, now());
    END IF;
  END IF;

  -- Handle rejection cases
  IF NEW.candidate_liked = false OR NEW.company_liked = false THEN
    IF NEW.match_status = 'pending' THEN
      NEW.match_status := 'rejected';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match status
DROP TRIGGER IF EXISTS check_match_status_trigger ON public.job_matching;
CREATE TRIGGER check_match_status_trigger
  BEFORE INSERT OR UPDATE ON public.job_matching
  FOR EACH ROW
  EXECUTE FUNCTION public.check_match_status();
