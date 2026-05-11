-- ============================================================================
-- Function: get_user_profile
-- Purpose: Safely retrieve user profile bypassing RLS for server-side operations
-- Used by: API routes that need to verify user_type and other profile data
-- ============================================================================

-- Drop existing function if it exists (handles return type changes)
DROP FUNCTION IF EXISTS get_user_profile(UUID) CASCADE;

CREATE FUNCTION get_user_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  email TEXT,
  stripe_customer_id TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_type,
    p.email,
    p.stripe_customer_id,
    p.full_name,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_profile(UUID) IS 'Retrieves user profile by ID, bypassing RLS for server-side operations. Used by API routes to verify user type and payment status.';
