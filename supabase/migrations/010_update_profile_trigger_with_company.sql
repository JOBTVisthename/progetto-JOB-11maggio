-- Updated trigger to automatically create profile AND candidate_profiles/company_profiles when user is created in auth
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
    INSERT INTO public.company_profiles (id, company_name)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'company_name'
    );
  END IF;

  RETURN NEW;
END;
$$;
