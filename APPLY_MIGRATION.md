# APPLY MIGRATION TO FIX REGISTRATION

## Quick Instructions

### Option 1: Supabase Dashboard (Easiest)

1. Open https://supabase.com/dashboard
2. Select your project: `cbpbwijovpfyqbxgtaiv`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content of `supabase/migrations/018_robust_registration_trigger.sql`
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Verify success - you should see "Success" at the bottom

### Option 2: Using psql (if you have access)

```bash
psql "postgresql://postgres:cbpbwijovpfyqbxgtaiv-postgres@aws-0-eu-west-1.pooler.supabase.com:6543/postgres" < supabase/migrations/018_robust_registration_trigger.sql
```

## What This Migration Fixes

1. **Removes enum type dependency** - No more `::user_type` casting issues
2. **Adds error handling** - Trigger won't fail registration if profile creation fails
3. **Adds logging** - Easy debugging in Supabase logs
4. **Fixes RLS policies** - Proper permissions for authenticated users
5. **Ensures all tables exist** - Creates tables if missing

## Test Registration After Migration

Once migration is applied, test registration:

1. Go to http://localhost:8022/register/candidate
2. Fill in all fields:
   - Email: test@example.com
   - Password: test123
   - Nome: Mario
   - Cognome: Rossi
   - Città: Milano
   - Telefono: 3331234567
3. Submit form
4. Check console for success message
5. Verify profile created in Supabase Dashboard > Authentication > Users

## Troubleshooting

### If registration still fails:

1. Check Supabase logs (Dashboard > Logs)
2. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. Verify function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

### If profile not created:

1. Check auth.users table for the user
2. Check public.profiles table for the profile
3. Check public.candidate_profiles table for the candidate profile

### Migration errors:

- Make sure you copied the ENTIRE file content
- Check for any syntax errors in SQL Editor
- Try running each section separately if needed
