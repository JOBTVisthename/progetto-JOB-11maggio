// ============================================================================
// Stripe Service - Payment & Subscription Management
// Real Stripe integration for company subscriptions
// ============================================================================

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// ============================================================================
// Configuration
// ============================================================================

// Stripe public key from environment
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

// Check if Stripe is properly configured
export const isStripeConfigured = (): boolean => {
  return STRIPE_PUBLIC_KEY !== '' && STRIPE_PUBLIC_KEY !== 'pk_test_placeholder';
};

// Load Stripe.js
export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// ============================================================================
// Plan Configurations
// ============================================================================

export const PRICING_PLANS = {
  starter: {
    id: 'starter' as const,
    name: 'STARTER',
    price: 200,
    originalPrice: 400,
    yearlyPrice: 2000,
    currency: 'EUR',
    interval: 'month',
    features: [
      '1 video job offer attivo al mese',
      'Rilancio organico sui canali social di Job TV e Marco Messina',
      'Dati & insight sulle performance'
    ],
    idealFor: '👉 Ideale per PMI, negozi e realtà che cercano una figura in modo occasionale',
    limits: {
      videosPerMonth: 1,
      profilesPerMonth: 20,
    }
  },
  builder: {
    id: 'builder' as const,
    name: 'BUILDER',
    price: 500,
    originalPrice: 1000,
    yearlyPrice: 5000,
    currency: 'EUR',
    interval: 'month',
    features: [
      '3 video job offer attivi al mese',
      'Pubblicazione su Job TV',
      'Rilancio organico sui canali social di Job TV e Marco Messina',
      'Sponsorizzazione del caso di successo per aumentare reach e credibilità',
      'Insight sulle performance delle campagne'
    ],
    idealFor: '👉 Ideale per aziende in crescita con più posizioni aperte',
    limits: {
      videosPerMonth: 3,
      profilesPerMonth: 150,
    }
  },
  hero: {
    id: 'hero' as const,
    name: 'HERO',
    price: 1000,
    originalPrice: 2000,
    yearlyPrice: 10000,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Video job offer illimitati ogni mese',
      'Rilancio organico sui canali social di Job TV e Marco Messina',
      'Sponsorizzazione dei contenuti e dei casi di successo',
      'Insight avanzati per ottimizzare le performance',
      'Collaborazioni dirette con Marco Messina'
    ],
    idealFor: '👉 Ideale per aziende strutturate che assumono con continuità',
    limits: {
      videosPerMonth: null, // unlimited
      profilesPerMonth: null, // unlimited
    }
  }
} as const;

export type PlanId = keyof typeof PRICING_PLANS;
export type Plan = typeof PRICING_PLANS[PlanId];
export type BillingInterval = 'month' | 'year';

// ============================================================================
// Checkout Session
// ============================================================================

export interface CreateCheckoutSessionOptions {
  planId: PlanId;
  userId: string;
  userEmail: string;
  interval?: BillingInterval;
  successUrl?: string;
  cancelUrl?: string;
  promoCode?: string;
  trialPeriodDays?: number;
}

export const createCheckoutSession = async (options: CreateCheckoutSessionOptions) => {
  try {
    const plan = PRICING_PLANS[options.planId];
    const interval = options.interval || 'month';
    const isYearly = interval === 'year';

    // Calculate price based on interval
    const price = isYearly ? plan.yearlyPrice : plan.price;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: options.planId,
        price,
        currency: plan.currency,
        interval,
        userEmail: options.userEmail,
        userId: options.userId,
        planName: plan.name,
        successUrl: options.successUrl || `${window.location.origin}/profile?tab=subscription&success=true`,
        cancelUrl: options.cancelUrl || `${window.location.origin}/pricing`,
        promoCode: options.promoCode,
        trialPeriodDays: options.trialPeriodDays,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (options: CreateCheckoutSessionOptions) => {
  const checkoutData = await createCheckoutSession(options);

  // Validate response
  if (!checkoutData.sessionId || !checkoutData.url) {
    throw new Error('Invalid checkout session response');
  }

  // Redirect to Stripe Checkout using the URL directly
  window.location.href = checkoutData.url;
};

// ============================================================================
// Subscription Management
// ============================================================================

// Get user's active subscription
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }
};

// Get all user subscriptions (including canceled)
export const getAllUserSubscriptions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }
};

// Create subscription record
export const createSubscriptionRecord = async (subscriptionData: {
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  plan_type: PlanId;
  status: Database['public']['Enums']['subscription_status'];
  current_period_start: string;
  current_period_end: string;
  trial_start?: string | null;
  trial_end?: string | null;
}) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating subscription record:', error);
    throw error;
  }
};

// Cancel subscription at period end
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    // Update local database record
    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: Database['public']['Enums']['subscription_status']
) => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

// ============================================================================
// Customer Portal
// ============================================================================

export interface CreatePortalSessionOptions {
  userId: string;
  returnUrl?: string;
}

export const createPortalSession = async (options: CreatePortalSessionOptions) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: options.userId,
        returnUrl: options.returnUrl || `${window.location.origin}/profile?tab=subscription`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

export const redirectToPortal = async (options: CreatePortalSessionOptions) => {
  const portalData = await createPortalSession(options);
  window.location.href = portalData.url;
};

// ============================================================================
// Payment History
// ============================================================================

export interface PaymentRecord {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partial_refund';
  payment_type: 'subscription' | 'one_time' | 'trial';
  period_start: string | null;
  period_end: string | null;
  description: string | null;
  metadata: any;
  refunded_amount: number;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const getPaymentHistory = async (userId: string, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('payment_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data as PaymentRecord[];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

export const getPaymentById = async (paymentId: string) => {
  try {
    const { data, error } = await supabase
      .from('payment_records')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      throw error;
    }

    return data as PaymentRecord;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

// ============================================================================
// Subscription Usage
// ============================================================================

export interface SubscriptionUsage {
  id: string;
  subscription_id: string;
  period_start: string;
  period_end: string;
  videos_posted: number;
  videos_remaining: number | null;
  profiles_viewed: number;
  profiles_remaining: number | null;
  messages_sent: number;
  matches_made: number;
  plan_type: 'starter' | 'builder' | 'hero';
  created_at: string;
  updated_at: string;
}

export const getSubscriptionUsage = async (subscriptionId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as SubscriptionUsage | null;
  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    throw error;
  }
};

export const incrementUsage = async (
  subscriptionId: string,
  counterType: 'videos_posted' | 'profiles_viewed' | 'messages_sent' | 'matches_made'
) => {
  try {
    const { data, error } = await supabase.rpc('increment_usage_counter', {
      p_subscription_id: subscriptionId,
      p_counter_type: counterType,
      p_increment: 1,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    throw error;
  }
};

// ============================================================================
// Stripe Customer Management
// ============================================================================

export const getStripeCustomerId = async (userId: string) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    return profile?.stripe_customer_id;
  } catch (error) {
    console.error('Error getting Stripe customer ID:', error);
    throw error;
  }
};

export const updateStripeCustomerId = async (userId: string, customerId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating Stripe customer ID:', error);
    throw error;
  }
};

// ============================================================================
// Utilities
// ============================================================================

// Check if Stripe is configured
export const ensureStripeConfigured = (): void => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe non è configurato. Contatta l\'amministratore.');
  }
};

// Format currency
export const formatCurrency = (amount: number, currency = 'EUR') => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

// Calculate days remaining
export const getDaysRemaining = (periodEnd: string) => {
  const endDate = new Date(periodEnd);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

// Get plan limits
export const getPlanLimits = (planId: PlanId) => {
  return PRICING_PLANS[planId].limits;
};

// Check if feature is available based on usage
export const isFeatureAvailable = async (
  userId: string,
  feature: 'videos' | 'profiles'
): Promise<boolean> => {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;

    const usage = await getSubscriptionUsage(subscription.id);
    if (!usage) return true; // No usage tracked, assume available

    if (feature === 'videos') {
      return usage.videos_remaining === null || usage.videos_remaining > 0;
    }

    if (feature === 'profiles') {
      return usage.profiles_remaining === null || usage.profiles_remaining > 0;
    }

    return false;
  } catch (error) {
    console.error('Error checking feature availability:', error);
    return false;
  }
};

// Get credits usage information
export const getCreditsUsage = async (userId: string) => {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return {
        hasSubscription: false,
        isUnlimited: false,
        remaining: 0,
        viewed: 0,
        planType: null
      };
    }

    const usage = await getSubscriptionUsage(subscription.id);
    if (!usage) {
      return {
        hasSubscription: true,
        isUnlimited: subscription.plan_type === 'hero',
        remaining: subscription.plan_type === 'hero' ? null : PRICING_PLANS[subscription.plan_type].limits?.profilesPerMonth || 0,
        viewed: 0,
        planType: subscription.plan_type
      };
    }

    const isUnlimited = usage.profiles_remaining === null;

    return {
      hasSubscription: true,
      isUnlimited,
      remaining: usage.profiles_remaining,
      viewed: usage.profiles_viewed,
      planType: usage.plan_type,
      periodStart: usage.period_start,
      periodEnd: usage.period_end
    };
  } catch (error) {
    console.error('Error fetching credits usage:', error);
    return null;
  }
};
