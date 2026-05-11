-- Add logo_url and additional company fields to company_profiles table
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS company_size text;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS founded_year integer;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('company-logos', 'company-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist (avoid conflicts)
DROP POLICY IF EXISTS "Public can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Companies can upload own logo" ON storage.objects;
DROP POLICY IF EXISTS "Companies can update own logo" ON storage.objects;
DROP POLICY IF EXISTS "Companies can delete own logo" ON storage.objects;

-- Storage policies for company-logos bucket
-- Allow anyone to view logos (public read)
CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Allow authenticated users to upload their company logo
CREATE POLICY "Companies can upload own logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow companies to update their own logo
CREATE POLICY "Companies can update own logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow companies to delete their own logo
CREATE POLICY "Companies can delete own logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS company_profiles_updated_at ON public.company_profiles;
DROP FUNCTION IF EXISTS update_company_profiles_updated_at();

-- Create updated_at function and trigger for company_profiles
CREATE OR REPLACE FUNCTION update_company_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_company_profiles_updated_at();
