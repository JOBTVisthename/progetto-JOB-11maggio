-- Add company tax and SDI information to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS sdi_code VARCHAR(7),
ADD COLUMN IF NOT EXISTS company_verified BOOLEAN DEFAULT FALSE;

-- Create index for faster VAT lookups
CREATE INDEX IF NOT EXISTS idx_profiles_vat ON public.profiles(vat_number) WHERE vat_number IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.profiles.vat_number IS 'P.IVA (Partita IVA) della azienda';
COMMENT ON COLUMN public.profiles.sdi_code IS 'Codice SDI (Sender Digital Identification Code)';
COMMENT ON COLUMN public.profiles.company_verified IS 'Indica se i dati aziendali sono stati verificati dalla Camera di Commercio';
