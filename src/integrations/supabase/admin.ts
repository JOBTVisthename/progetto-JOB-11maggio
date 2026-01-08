import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoding the URL and Service Role Key to ensure it works in the browser
// as the standard client.ts does.
const SUPABASE_URL = "https://cbpbwijovpfyqbxgtaiv.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicGJ3aWpvdnBmeXFieGd0YWl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDU4MjUwNiwiZXhwIjoyMDYwMTU4NTA2fQ.S3JwE9KzJNjXGcV7kY8mFzLqR2hTmPqVnWxBsKdDfLg";

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
