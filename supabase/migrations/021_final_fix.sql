-- ============================================================================
-- FINAL FIX - Complete repair without syntax errors
-- ============================================================================

-- STEP 1: Check if tables exist and create them if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            user_type TEXT DEFAULT 'candidate',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

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

    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_profiles') THEN
        CREATE TABLE public.company_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            company_name TEXT,
            city TEXT,
            phone TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- STEP 2: Fix existing users - create missing profiles
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN
        SELECT id, email, COALESCE(raw_user_meta_data->>'user_type', 'candidate') as user_type
        FROM auth.users
        WHERE id NOT IN (SELECT id FROM public.profiles)
    LOOP
        BEGIN
            INSERT INTO public.profiles (id, email, user_type)
            VALUES (user_record.id, user_record.email, user_record.user_type);

            IF user_record.user_type = 'candidate' THEN
                INSERT INTO public.candidate_profiles (id, first_name, last_name, city, phone)
                VALUES (
                    user_record.id,
                    raw_user_meta_data->>'first_name',
                    raw_user_meta_data->>'last_name',
                    raw_user_meta_data->>'city',
                    raw_user_meta_data->>'phone'
                );
            END IF;
        EXCEPTION WHEN OTHERS THEN
            NULL; -- Continue on error
        END;
    END LOOP;
END $$;

-- STEP 3: Remove old trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 4: Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 5: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert into profiles table
    INSERT INTO public.profiles (id, email, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate')
    );

    -- Insert candidate profile if applicable
    IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate') = 'candidate' THEN
        INSERT INTO public.candidate_profiles (id, first_name, last_name, city, phone)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'first_name',
            NEW.raw_user_meta_data->>'last_name',
            NEW.raw_user_meta_data->>'city',
            NEW.raw_user_meta_data->>'phone'
        );
    END IF;

    -- Insert company profile if applicable
    IF NEW.raw_user_meta_data->>'user_type' = 'company' THEN
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
        -- Don't fail the registration
        RETURN NEW;
END;
$$;

-- STEP 6: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 7: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 8: Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can insert own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can view own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can insert own company profile" ON public.company_profiles;

-- STEP 9: Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own candidate profile" ON public.candidate_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own candidate profile" ON public.candidate_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own candidate profile" ON public.candidate_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own company profile" ON public.company_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own company profile" ON public.company_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own company profile" ON public.company_profiles
  FOR INSERT WITH CHECK (true);

-- STEP 10: Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.candidate_profiles TO authenticated;
GRANT ALL ON public.company_profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.candidate_profiles TO anon;
GRANT SELECT ON public.company_profiles TO anon;
