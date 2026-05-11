# Stripe Payment & Subscription Implementation Plan

## Current State Analysis

### Existing Tables (DO NOT MODIFY)
- **`profiles`**: User profiles with `stripe_customer_id` column
- **`subscriptions`**: Current subscription tracking table
- **`candidate_profiles`**: Candidate data
- **`company_profiles`**: Company data
- **`job_matching`**: Matches between candidates and companies
- **`messages`**: Messaging system
- **`video_interviews`**: Video interviews

### Current Implementation Status
- Stripe is **disabled** (mock mode only)
- Frontend has pricing plans (starter, builder, hero)
- Mock checkout API at `/api/create-checkout-session`
- `useSubscription` hook for subscription management
- No real Stripe integration
- No webhook handlers
- No payment history tracking

---

## Implementation Plan

### Phase 1: Database Schema Extensions (New Tables Only)

#### 1.1 Payment History Table
**Purpose**: Track all payment transactions, one-time payments, and invoices

```sql
CREATE TABLE public.payment_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE,
  stripe_invoice_id text UNIQUE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'partial_refund')),
  payment_type text NOT NULL CHECK (payment_type IN ('subscription', 'one_time', 'trial')),

  -- For subscription payments
  period_start timestamptz,
  period_end timestamptz,

  -- Metadata
  description text,
  metadata jsonb DEFAULT '{}',

  -- Refund info
  refunded_amount decimal(10,2) DEFAULT 0,
  refund_reason text,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_payment_records_user_id ON public.payment_records(user_id);
CREATE INDEX idx_payment_records_subscription_id ON public.payment_records(subscription_id);
CREATE INDEX idx_payment_records_status ON public.payment_records(status);
CREATE INDEX idx_payment_records_created_at ON public.payment_records(created_at DESC);

-- RLS Policies
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment records" ON public.payment_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment records" ON public.payment_records
  FOR SELECT USING (is_admin(auth.uid()));
```

#### 1.2 Stripe Events Log Table
**Purpose**: Log all Stripe webhook events for debugging and audit

```sql
CREATE TABLE public.stripe_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed boolean DEFAULT false,
  processing_error text,

  -- Event data (full JSON)
  event_data jsonb NOT NULL,

  -- Related entities (optional)
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_record_id uuid REFERENCES public.payment_records(id) ON DELETE SET NULL,

  -- Timestamps
  received_at timestamptz DEFAULT now() NOT NULL,
  processed_at timestamptz
);

-- Indexes
CREATE INDEX idx_stripe_events_stripe_event_id ON public.stripe_events(stripe_event_id);
CREATE INDEX idx_stripe_events_event_type ON public.stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed ON public.stripe_events(processed);
CREATE INDEX idx_stripe_events_received_at ON public.stripe_events(received_at DESC);

-- RLS ( admins only for this table)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all stripe events" ON public.stripe_events
  FOR SELECT USING (is_admin(auth.uid()));
```

#### 1.3 Subscription Usage Table (Optional - for metered billing)
**Purpose**: Track usage-based metrics for each subscription

```sql
CREATE TABLE public.subscription_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,

  -- Usage metrics
  videos_posted integer DEFAULT 0,
  videos_remaining integer,
  profiles_viewed integer DEFAULT 0,
  profiles_remaining integer,
  messages_sent integer DEFAULT 0,

  -- Metadata
  metadata jsonb DEFAULT '{}',

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  UNIQUE(subscription_id, period_start, period_end)
);

-- Indexes
CREATE INDEX idx_subscription_usage_subscription_id ON public.subscription_usage(subscription_id);
CREATE INDEX idx_subscription_usage_period ON public.subscription_usage(period_start, period_end);

-- RLS
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription usage" ON public.subscription_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_usage.subscription_id
      AND s.user_id = auth.uid()
    )
  );
```

---

### Phase 2: Backend Implementation

#### 2.1 Supabase Edge Functions

##### Webhook Handler: `stripe-webhook`
**Location**: `supabase/functions/stripe-webhook/index.ts`

**Events to handle**:
- `checkout.session.completed` - New subscription/one-time payment
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated (plan change, etc.)
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.paid` - Payment succeeded
- `invoice.payment_failed` - Payment failed
- `invoice.payment_action_required` - 3D Secure required

##### API: `create-checkout-session` (Enhanced)
**Location**: Update existing `src/pages/api/create-checkout-session/route.ts`

**Features**:
- Support both one-time payments and subscriptions
- Generate Stripe Checkout Session
- Handle trial periods
- Support promo codes

##### API: `create-portal-session` (New)
**Location**: `src/pages/api/create-portal-session/route.ts`

**Features**:
- Generate Stripe Customer Portal link
- Allow users to manage subscriptions
- Update payment methods
- View invoices

#### 2.2 Stripe Configuration

**Environment Variables Needed**:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_ENABLE_STRIPE=true
SUPABASE_SERVICE_ROLE_KEY=... (for webhook processing)
```

**Stripe Products & Prices** (to be created in Stripe Dashboard):
```
Product: JobTV Starter
- Price: €200/month (price_starter_monthly)
- Price: €2000/year (price_starter_yearly) - 2 months free

Product: JobTV Builder
- Price: €500/month (price_builder_monthly)
- Price: €5000/year (price_builder_yearly) - 2 months free

Product: JobTV Hero
- Price: €1000/month (price_hero_monthly)
- Price: €10000/year (price_hero_yearly) - 2 months free
```

---

### Phase 3: Frontend Updates

#### 3.1 Update `stripeService.ts`

**Changes needed**:
1. Enable real Stripe integration (remove mock mode)
2. Add Stripe.js loading
3. Update checkout flow to use real Stripe
4. Add portal session creation
5. Add payment history fetching
6. Update subscription management functions

#### 3.2 Update `PricingPlans.tsx`

**Changes needed**:
1. Add annual/monthly toggle
2. Show real Stripe checkout
3. Add promo code input
4. Update UI for trial offers

#### 3.3 Create New Components

**`PaymentHistory.tsx`**:
- Display payment history
- Show invoices
- Download PDF invoices

**`SubscriptionManagement.tsx`**:
- Current subscription details
- Usage metrics
- Upgrade/downgrade options
- Cancel subscription
- Update payment method

**`PaymentMethodForm.tsx`**:
- Add new payment method
- Update existing card

---

### Phase 4: Testing Strategy

#### 4.1 Stripe Test Mode Testing

**Test Cards**:
- Success: `4242 4242 4242 4242`
- Requires 3D Secure: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 0002`
- Insufficient Funds: `4000 0000 0000 9995`

#### 4.2 Test Scenarios

1. **New Subscription Flow**
   - User selects plan
   - Redirects to Stripe checkout
   - Completes payment
   - Webhook processes subscription
   - Database updated correctly
   - User has access to premium features

2. **Subscription Update Flow**
   - User upgrades/downgrades plan
   - Stripe proration calculated correctly
   - Database updated

3. **Cancellation Flow**
   - User cancels subscription
   - Access until period end
   - Webhook confirms cancellation

4. **Failed Payment Flow**
   - Payment method expired
   - Retry logic
   - User notification

5. **Trial Flow**
   - User starts trial
   - Trial ends
   - First payment collected

---

### Phase 5: Security & Compliance

#### 5.1 Security Measures

1. **Webhook Signature Verification**
   - Verify all webhook signatures
   - Reject invalid requests

2. **Row Level Security (RLS)**
   - All new tables have RLS enabled
   - Users can only see their own data
   - Admins have full access

3. **API Key Protection**
   - Never expose secret keys
   - Use environment variables
   - Service role key only in Edge Functions

4. **Data Encryption**
   - Supabase handles encryption at rest
   - HTTPS for all communications

#### 5.2 PCI Compliance

- Use Stripe Checkout (SAQ A level)
- No card data touches our servers
- All payment processing via Stripe

---

### Phase 6: Monitoring & Maintenance

#### 6.1 Logging

- All Stripe events logged
- Payment failures monitored
- Webhook errors tracked

#### 6.2 Alerts

- Failed payment notifications
- Subscription cancellations
- Revenue tracking

#### 6.3 Admin Dashboard Updates

**New Admin Pages**:
- Revenue dashboard
- Active subscriptions list
- Payment history
- Churn tracking
- Customer LTV

---

## Migration Strategy

### Safe Migration Steps

1. **Create new tables** (no impact on existing data)
2. **Deploy Edge Functions** (canary release)
3. **Enable Stripe in test mode** (validate all flows)
4. **Update frontend** (feature flag controlled)
5. **Gradual rollout** (10% -> 50% -> 100%)
6. **Monitor & fix issues**

### Rollback Plan

- Keep existing mock implementation
- Feature flag to disable Stripe
- Database migrations are additive only (no breaking changes)

---

## API Endpoints Summary

### Existing (to update)
- `POST /api/create-checkout-session` - Update for real Stripe

### New Endpoints
- `POST /api/create-portal-session` - Customer portal link
- `GET /api/payments/history` - Payment history
- `POST /api/webhooks/stripe` - Stripe webhook (Edge Function)

### Stripe Service Functions
```typescript
// Existing (update)
createCheckoutSession(planId, userId, userEmail)
getUserSubscription(userId)
cancelSubscription(subscriptionId)

// New
createPortalSession(userId)
getPaymentHistory(userId)
handleSubscriptionUpdated(event)
handleInvoicePaid(event)
handlePaymentFailed(event)
```

---

## Files to Create/Update

### New Files
- `supabase/migrations/004_create_payment_records_table.sql`
- `supabase/migrations/005_create_stripe_events_table.sql`
- `supabase/migrations/006_create_subscription_usage_table.sql`
- `supabase/functions/stripe-webhook/index.ts`
- `src/pages/api/create-portal-session/route.ts`
- `src/components/payment/PaymentHistory.tsx`
- `src/components/payment/SubscriptionManagement.tsx`
- `src/components/payment/PaymentMethodForm.tsx`

### Updated Files
- `src/integrations/stripe/stripeService.ts` - Enable real Stripe
- `src/pages/PricingPlans.tsx` - Annual/monthly toggle
- `src/pages/Settings.tsx` - Add subscription management tab
- `src/pages/AdminDashboard.tsx` - Payment analytics
- `.env` - Add Stripe keys

---

## Success Criteria

- [ ] All webhooks process correctly
- [ ] Payment history accurately tracked
- [ ] Users can manage subscriptions via Stripe Portal
- [ ] Failed payments handled gracefully
- [ ] Admin dashboard shows revenue data
- [ ] Zero impact on existing data
- [ ] All security measures in place
- [ ] Complete audit trail in `stripe_events` table

---

## Next Steps

1. **Review this plan** and approve
2. **Set up Stripe account** and create products/prices
3. **Run database migrations** in test environment
4. **Implement Edge Functions**
5. **Test thoroughly** with Stripe test mode
6. **Deploy to production** with feature flags

---

## Implementation Status

### Completed Tasks ✅

#### Database Migrations
- ✅ `004_create_payment_records_table.sql` - Payment history tracking
- ✅ `005_create_stripe_events_table.sql` - Webhook audit log
- ✅ `006_create_subscription_usage_table.sql` - Usage metrics tracking

#### Backend Implementation
- ✅ `supabase/functions/stripe-webhook/index.ts` - Complete webhook handler
  - Handles: checkout.session.completed, customer.subscription.*, invoice.*
  - Signature verification
  - Duplicate event detection
  - Error handling and logging

- ✅ `src/pages/api/create-portal-session/route.js` - Customer portal session creation
- ✅ `src/pages/api/create-checkout-session/route.js` - **UPDATED: Company-only restriction enforced**
  - **CRITICAL**: Only companies can subscribe to plans
  - Validates user_type before creating checkout session
  - Returns 403 error with COMPANY_ONLY code for candidates
  - Mock mode also enforces company-only restriction

#### Frontend Implementation
- ✅ `src/integrations/stripe/stripeService.ts` - Complete rewrite
  - Real Stripe integration with fallback to mock mode
  - New functions: getPaymentHistory, getSubscriptionUsage, createPortalSession
  - Utilities: formatCurrency, formatDate, getDaysRemaining
  - Support for monthly/annual billing

- ✅ `src/components/payment/PaymentHistory.tsx` - Payment history component
- ✅ `src/components/payment/SubscriptionManagement.tsx` - Subscription management component
- ✅ `src/pages/PricingPlans.tsx` - **UPDATED: Company-only UI**
  - Fetches user_type on mount
  - Shows informative banner for candidates
  - Disables subscription buttons for candidates
  - Displays "Aziende Solo" message on buttons
  - Toast notification when candidates try to subscribe

#### Security Enhancements
- ✅ **Company-Only Subscriptions**: Both backend and frontend enforce that only companies can subscribe
  - Backend: API returns 403 for non-company users
  - Frontend: UI prevents candidates from attempting checkout
  - User-friendly messaging explaining the restriction

### Remaining Tasks 🔄

#### Configuration
- [ ] Add environment variables:
  - `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
  - `STRIPE_SECRET_KEY` - Stripe secret key (for Edge Functions)
  - `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

#### Stripe Dashboard Setup
- [ ] Create Stripe products and prices:
  ```
  Product: JobTV Starter
  - Price: €200/month (price_starter_monthly)
  - Price: €2000/year (price_starter_yearly) - 2 months free

  Product: JobTV Builder
  - Price: €500/month (price_builder_monthly)
  - Price: €5000/year (price_builder_yearly) - 2 months free

  Product: JobTV Hero
  - Price: €1000/month (price_hero_monthly)
  - Price: €10000/year (price_hero_yearly) - 2 months free
  ```

- [ ] Set up webhook endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- [ ] Enable events: checkout.session.completed, customer.subscription.*, invoice.*

#### Integration
- [ ] Update `src/pages/Settings.tsx` - Add subscription management tab
- [ ] Update `src/pages/AdminDashboard.tsx` - Add payment analytics
- [ ] Install Stripe SDK: `npm install @stripe/stripe-js`

#### Testing
- [ ] Test with Stripe test mode using test cards
- [ ] Verify all webhook events process correctly
- [ ] Test payment flow end-to-end
- [ ] Test subscription upgrade/downgrade
- [ ] Test cancellation flow

#### Deployment
- [ ] Run migrations: `supabase db push`
- [ ] Deploy Edge Function: `supabase functions deploy stripe-webhook`
- [ ] Set Edge Function secrets:
  ```bash
  supabase secrets set STRIPE_SECRET_KEY=sk_test_...
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### Key Features Implemented

1. **Complete Payment History** - Track all transactions with status, refunds, and metadata
2. **Webhook Audit Log** - Every Stripe event logged for debugging
3. **Usage Tracking** - Videos, profiles, messages tracked per billing period
4. **Stripe Customer Portal** - Users can manage subscriptions independently
5. **Plan Limits** - Enforce usage limits based on subscription tier
6. **Graceful Fallback** - Mock mode works when Stripe is not configured

### Files Created/Modified

| File | Status | Description |
|------|--------|-------------|
| `supabase/migrations/004_*.sql` | ✅ New | Payment records table |
| `supabase/migrations/005_*.sql` | ✅ New | Stripe events table |
| `supabase/migrations/006_*.sql` | ✅ New | Subscription usage table |
| `supabase/functions/stripe-webhook/index.ts` | ✅ New | Webhook handler |
| `src/pages/api/create-portal-session/route.js` | ✅ New | Portal session API |
| `src/pages/api/create-checkout-session/route.js` | ✅ Updated | Company-only restriction |
| `src/integrations/stripe/stripeService.ts` | ✅ Updated | Real Stripe integration |
| `src/components/payment/PaymentHistory.tsx` | ✅ New | Payment history UI |
| `src/components/payment/SubscriptionManagement.tsx` | ✅ New | Subscription management UI |
| `src/pages/PricingPlans.tsx` | ✅ Updated | Company-only UI |
| `src/hooks/useAuthService.ts` | ✅ Updated | Email confirmation fix |
| `src/pages/ResetPassword.tsx` | ✅ Updated | Password reset flow fix |
| `pagamenti.md` | ✅ Updated | This document |

---

*Last Updated: 2026-01-15*
*Status: Implementation Phase - Core Features Complete + Security Enhancements*
*Next: Stripe Dashboard Setup & Testing*

### Recent Changes (2026-01-15)
- ✅ Fixed registration email confirmation (added `emailConfirmTo: true`)
- ✅ Fixed password reset flow (session handling with access_token)
- ✅ **CRITICAL**: Enforced company-only subscriptions in both backend and frontend
  - Backend API validates user_type before checkout
  - Frontend UI prevents candidates from subscribing
  - User-friendly messaging for candidates
