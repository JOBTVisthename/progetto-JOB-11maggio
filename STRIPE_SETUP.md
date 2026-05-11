# Stripe Integration Setup Guide for JobTV

This guide covers setting up Stripe for company subscriptions in your JobTV application.

## Overview

The Stripe integration allows companies to:
- Subscribe to Starter (€200), Builder (€500), or Hero (€1000) plans
- Pay via Stripe Checkout
- Manage subscriptions via Customer Portal
- Receive webhooks for payment events

**Important**: This implementation uses real Stripe only. Mock mode has been removed.

## Test Keys (Sandbox)

Your test keys are already configured in `.env`:
- **Publishable Key**: `pk_test_51SMrNtLf6celbmU505up7zItsAFw8lAarOCLSfQ2JyWoidYvpnljTuutmv9jydGT6hD20NafwKBfe4MRFHIAVmgG00CBBEfPMZ`
- **Secret Key**: `sk_test_51SMrNtLf6celbmU5dcYN7L5ZnjpEceWeLyB5UOxWZ1ug5AVvwEWghqnk5oiclVGGmulQwHheddPlKoy16PglUPPr00V2ftCYOl`

## Step 1: Set Up Webhook Endpoint in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Use your Supabase Edge Function URL:
   ```
   https://cbpbwijovpfyqbxgtaiv.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the **Webhook Secret** (starts with `whsec_...`)
6. Add it to your `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

## Step 2: Deploy Webhook Function

Deploy the Stripe webhook handler to Supabase:

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref cbpbwijovpfyqbxgtaiv

# Deploy the webhook function
supabase functions deploy stripe-webhook
```

Make sure your Stripe keys are set in Supabase:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/cbpbwijovpfyqbxgtaiv/settings/functions)
2. Add these environment variables:
   - `STRIPE_SECRET_KEY`: `sk_test_51SMrNtLf6celbmU5dcYN7L5ZnjpEceWeLyB5UOxWZ1ug5AVvwEWghqnk5oiclVGGmulQwHheddPlKoy16PglUPPr00V2ftCYOl`
   - `STRIPE_WEBHOOK_SECRET`: Your webhook secret from Step 1

## Step 3: Test the Integration

### Test Checkout Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login as a company user

3. Go to `/pricing-plans`

4. Click "Scegli Piano" on any plan

5. You should be redirected to Stripe Checkout (test mode)

6. Complete payment with test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

### Test Webhook Events

After completing checkout:
1. Go to Stripe Dashboard > Webhooks
2. Check for recent events
3. Verify your subscription was created in:
   - `subscriptions` table
   - `subscription_usage` table
   - `stripe_events` log table

## Step 4: Production Setup

When ready for production:

1. Get your live keys from [Stripe Dashboard > Developers](https://dashboard.stripe.com/keys)
2. Update production environment variables
3. Create a production webhook endpoint
4. Update the production webhook secret

## Database Tables Used

- `subscriptions` - Active subscription records
- `subscription_usage` - Credit tracking per period
- `unlocked_candidates` - Permanently unlocked candidates
- `payment_records` - Payment history
- `stripe_events` - Webhook event log

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/create-checkout-session` | Create Stripe Checkout session |
| `/api/create-portal-session` | Create Customer Portal session |
| `/functions/v1/stripe-webhook` | Handle Stripe webhooks |

## Testing Cards

Use these Stripe test cards:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

## Troubleshooting

### "Stripe non è configurato" error
- Verify VITE_STRIPE_PUBLIC_KEY is set in `.env`
- Check the key starts with `pk_test_` or `pk_live_`
- Restart the development server after updating `.env`

### Webhook not receiving events
- Check webhook URL in Stripe Dashboard
- Verify STRIPE_WEBHOOK_SECRET is set
- Check Supabase function logs

### Subscription not created
- Check `stripe_events` table for errors
- Verify metadata includes `user_id` and `plan_type`
- Check console logs in webhook function

### Checkout fails
- Verify user_type is 'company'
- Check Stripe API keys are correct
- Check console for error messages

## Current Implementation Status

- ✅ Stripe Checkout session creation (real Stripe only)
- ✅ Customer Portal access
- ✅ Webhook handler (all events)
- ✅ Subscription tracking
- ✅ Usage-based credits (unlocked candidates)
- ✅ Payment history
- ✅ Company-only subscription enforcement
- ❌ Mock mode removed (production-ready only)

## Next Steps

1. **Set up webhook endpoint** (see Step 1 above)
2. **Deploy webhook function** to Supabase
3. **Test with Stripe test cards**:
   - `4242 4242 4242 4242` - Success
   - `4000 0000 0000 0002` - Declined
4. **Verify subscription creation** in database after payment
