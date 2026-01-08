# Admin User Setup Guide

## Problem Identified
The original `create-admin.js` script fails with "Invalid API key" error because the service role key in your `.env` file is invalid or expired.

## Solutions

### Option 1: Fix Service Role Key (Recommended)

1. **Get a new service role key:**
   - Go to: https://supabase.com/dashboard/project/cbpbwijovpfyqbxgtaiv
   - Navigate to **Project Settings** > **API**
   - Find the **"service_role"** key under "Project API keys" section
   - Copy the service_role key

2. **Update your .env file:**
   ```bash
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key_here
   ```

3. **Run the original script:**
   ```bash
   node scripts/create-admin.js
   ```

### Option 2: Manual Setup via Dashboard

1. **Create the admin user:**
   - Go to: https://supabase.com/dashboard/project/cbpbwijovpfyqbxgtaiv
   - Navigate to **Authentication** > **Users**
   - Click **"Add user"**
   - Fill in:
     - Email: `admin@jobtv.com`
     - Password: `Stocazzo1.1`
     - Set "Confirm email" to **ON**
     - Add user metadata: `{"role": "admin"}`
   - Click **"Save"**

2. **Create the profile record:**
   - Go to **SQL Editor**
   - Copy and paste the SQL from `scripts/setup-admin.sql`
   - Click **"Run"** to execute

### Option 3: Use the Diagnostic Script

Run the diagnostic script to check current status:
```bash
node scripts/create-admin-fixed.js
```

This will tell you:
- Whether the admin user exists
- Whether the profile is set up correctly
- What steps you need to take

## Testing the Setup

After completing any of the options above, test with:

```bash
node scripts/create-admin-fixed.js
```

You should see:
```
✅ Admin user exists! User ID: [some-uuid]
✅ Profile exists: { role: 'admin', user_type: 'company' }
🎉 Admin setup is complete! You can now use /admin/dashboard
```

## Admin Credentials

Once set up:
- **Email:** admin@jobtv.com
- **Password:** Stocazzo1.1
- **Admin Dashboard:** /admin/dashboard

## Files Created

- `scripts/create-admin.js` - Original script (needs valid service role key)
- `scripts/create-admin-fixed.js` - Diagnostic and guide script
- `scripts/setup-admin.sql` - SQL commands for manual setup
- `scripts/README-ADMIN-SETUP.md` - This guide

## Common Issues

1. **"Invalid API key"** - Service role key is expired/invalid. Use Option 1 to fix.
2. **"Admin user does not exist"** - User hasn't been created yet. Use Option 2.
3. **"Profile does not exist"** - User exists but profile is missing. Run the SQL from setup-admin.sql.
4. **Wrong role/user_type** - Profile exists but has wrong values. Run the SQL from setup-admin.sql to fix.

## Security Notes

- The password `Stocazzo1.1` is for development only
- Change the password after initial setup in production
- The service role key should be kept secure and never committed to version control
