-- ============================================================================
-- FIX REGISTRATION TRIGGER - Complete migration for user registration
-- ============================================================================

-- First, let's ensure all tables have the correct structure

-- Ensure candidate_profiles has all required columns
DO $$
BEGIN
    -- Check if table exists, if not create it
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'candidate_profiles') THEN
        CREATE TABLE public.candidate_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name TEXT,
            last_name TEXT,
            city TEXT,
            phone TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Add columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_profiles' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE public.candidate_profiles ADD COLUMN first_name TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_profiles' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE public.candidate_profiles ADD COLUMN last_name TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_profiles' AND column_name = 'city'
    ) THEN
        ALTER TABLE public.candidate_profiles ADD COLUMN city TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.candidate_profiles ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_profiles' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.candidate_profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.candidate_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Ensure company_profiles has all required columns
DO $$
BEGIN
    -- Check if table exists, if not create it
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_profiles') THEN
        CREATE TABLE public.company_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            company_name TEXT,
            city TEXT,
            phone TEXT,
            logo_url TEXT,
            description TEXT,
            website TEXT,
            industry TEXT,
            company_size TEXT,
            founded_year INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Add columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'company_name'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN company_name TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'city'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN city TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN logo_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'description'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'website'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN website TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'industry'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN industry TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'company_size'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN company_size TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'founded_year'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN founded_year INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.company_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- RECREATE THE REGISTRATION TRIGGER
-- ============================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the new trigger function that handles both candidates and companies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into main profiles table
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate')::user_type
  );

  -- Insert into candidate_profiles if candidate
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate')::user_type = 'candidate' THEN
    INSERT INTO public.candidate_profiles (id, first_name, last_name, city, phone)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'phone'
    );
  END IF;

  -- Insert into company_profiles if company
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate')::user_type = 'company' THEN
    INSERT INTO public.company_profiles (id, company_name, city, phone)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'company_name',
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'phone'
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Re-raise the error so Supabase knows something went wrong
    RAISE;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (if not already enabled)
-- ============================================================================

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for candidate_profiles
DROP POLICY IF EXISTS "Users can view own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;

CREATE POLICY "Users can view own candidate profile"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for company_profiles
DROP POLICY IF EXISTS "Users can view own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update own company profile" ON public.company_profiles;

CREATE POLICY "Users can view own company profile"
  ON public.company_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own company profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = id);
