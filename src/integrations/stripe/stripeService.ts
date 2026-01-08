import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Public Stripe key - should be loaded from environment variables
export const STRIPE_PUBLIC_KEY = 'pk_test_51SXqufJUn7rAfob6hjiwEXTGL5PPkn2nQXXEjjXueOfS6u7UdHBrwN4GuSClKIVSle0ccrAqsVzGOPkh2IpCU75F00n61XlgZJ';

export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Plan configurations
export const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'STARTER',
    price: 200,
    originalPrice: 400,
    currency: 'EUR',
    interval: 'month',
    features: [
      '1 video annuncio job offer attivo al mese',
      'Pubblicazione su Job TV + rilancio organico sui social',
      '20 video-curriculum in target/mese (accesso limitato)',
      'Dati & Insight'
    ],
    idealFor: 'PMI, negozi, franchising, hospitality, aziende che vogliono testare il formato video.'
  },
  builder: {
    id: 'builder',
    name: 'BUILDER',
    price: 500,
    originalPrice: 1000,
    currency: 'EUR',
    interval: 'month',
    features: [
      '3 video annunci attivi al mese',
      'Distribuzione continuativa ottimizzata',
      '150 video-curriculum in target/mese',
      'Minimo 50 video-CV garantiti per ogni annuncio',
      'Performance organica cross-social (TikTok, Instagram, LinkedIn, YouTube)'
    ],
    idealFor: 'Aziende in crescita, realtà con hiring mensile, retail strutturato, logistica, centri servizi.'
  },
  hero: {
    id: 'hero',
    name: 'HERO',
    price: 1000,
    originalPrice: 2000,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Video annunci inclusi',
      'Annunci illimitati ogni mese',
      'Nessun limite di upload',
      'Nessuna restrizione sui contenuti',
      'Video-curriculum illimitati in target/mese'
    ],
    idealFor: 'Corporate, gruppi multi-sede, grandi team HR, alta richiesta di personale, progetti annuali di employer branding.'
  }
} as const;

export type PlanId = keyof typeof PRICING_PLANS;
export type Plan = typeof PRICING_PLANS[PlanId];

// Create a checkout session via backend API
export const createCheckoutSession = async (planId: PlanId, userEmail: string, userId: string) => {
  try {
    const plan = PRICING_PLANS[planId];
    
    // Call backend API to create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        price: plan.price,
        currency: plan.currency,
        userEmail,
        userId,
        planName: plan.name
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to checkout
export const redirectToCheckout = async (planId: PlanId, userEmail: string, userId: string) => {
  const checkoutData = await createCheckoutSession(planId, userEmail, userId);
  
  // Check if this is a mock response
  if (checkoutData.isMock) {
    // For mock mode, redirect to success page directly
    window.location.href = `/profile?tab=subscription&success=true&mock=true`;
    return;
  }

  // For real Stripe, use the session ID
  const sessionId = checkoutData.sessionId;
  
  // Redirect to Stripe Checkout using direct URL
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  // Use Stripe's checkout URL format
  window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
};

// Get user's subscription from database
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }
};

// Create subscription record in database (called after successful checkout)
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

// Cancel subscription via backend API
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

// Mock checkout for development
export const mockCheckout = (planId: PlanId) => {
  const plan = PRICING_PLANS[planId];
  console.log(`Mock checkout for ${plan.name} plan - €${plan.price}/month`);
  alert(`Mock checkout initiated for ${plan.name} plan - €${plan.price}/month\nIn production, this would redirect to Stripe checkout.`);
  return Promise.resolve();
};

// Get Stripe customer ID from user profile
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

// Update Stripe customer ID in user profile
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

// Test/Sandbox mode utilities
export const isTestMode = () => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

// Process mock payment (for testing)
export const processMockPayment = async (planId: PlanId, userId: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        price: PRICING_PLANS[planId].price,
        currency: 'EUR',
        userEmail: 'test@example.com',
        userId,
        planName: PRICING_PLANS[planId].name
      }),
    });

    const data = await response.json();
    
    if (data.isMock) {
      console.log('Mock payment processed successfully:', data);
      return data.subscription;
    }
    
    throw new Error('Expected mock response');
  } catch (error) {
    console.error('Error processing mock payment:', error);
    throw error;
  }
};
