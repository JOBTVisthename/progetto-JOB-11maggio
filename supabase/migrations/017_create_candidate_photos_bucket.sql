-- ============================================================================
-- Create storage bucket for candidate profile photos
-- ============================================================================

-- Insert storage bucket for candidate photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-photos', 'candidate-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Candidates can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view candidate photos" ON storage.objects;

-- Policy: Candidates can upload their own photos
CREATE POLICY "Candidates can upload their own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'candidate-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Candidates can view their own photos
CREATE POLICY "Candidates can view their own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'candidate-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Public can view candidate photos
CREATE POLICY "Public can view candidate photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'candidate-photos');

-- Policy: Candidates can delete their own photos
CREATE POLICY "Candidates can delete their own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'candidate-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
