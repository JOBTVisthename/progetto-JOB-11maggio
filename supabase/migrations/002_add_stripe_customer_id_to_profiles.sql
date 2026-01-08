-- Add stripe_customer_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Add comment to describe the column
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for billing and subscription management';
