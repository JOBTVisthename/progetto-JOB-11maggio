import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { PRICING_PLANS, PlanId, getUserSubscription, createSubscriptionRecord } from '@/integrations/stripe/stripeService';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user subscription
  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUserSubscription(user.id);
      setSubscription(data || null);
    } catch (err) {
      setError('Errore nel caricamento dell\'abbonamento');
    } finally {
      setLoading(false);
    }
  };

  // Create new subscription record (after successful Stripe checkout)
  const createSubscription = async (planId: PlanId, subscriptionData: {
    stripe_subscription_id: string;
    stripe_customer_id: string;
    current_period_start: string;
    current_period_end: string;
    trial_start?: string | null;
    trial_end?: string | null;
  }): Promise<Subscription> => {
    if (!user) {
      throw new Error('Utente non autenticato');
    }

    try {
      const data = await createSubscriptionRecord({
        user_id: user.id,
        stripe_subscription_id: subscriptionData.stripe_subscription_id,
        stripe_customer_id: subscriptionData.stripe_customer_id,
        stripe_price_id: `price_${planId}`,
        plan_type: planId,
        status: 'active',
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        trial_start: subscriptionData.trial_start,
        trial_end: subscriptionData.trial_end,
      });

      setSubscription(data);
      return data;
    } catch (err) {
      setError('Errore nella creazione dell\'abbonamento');
      throw err;
    }
  };

  // Update subscription status
  const updateSubscriptionStatus = async (subscriptionId: string, status: Database['public']['Enums']['subscription_status']) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', subscriptionId);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh subscription data
      await fetchSubscription();
    } catch (err) {
      setError('Errore nell\'aggiornamento dello stato');
      throw err;
    }
  };

  // Cancel subscription at period end
  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          cancel_at_period_end: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', subscriptionId);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      if (subscription && subscription.id === subscriptionId) {
        setSubscription({ ...subscription, cancel_at_period_end: true });
      }
    } catch (err) {
      setError('Errore nella cancellazione dell\'abbonamento');
      throw err;
    }
  };

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    return subscription && subscription.status === 'active' && !subscription.cancel_at_period_end;
  };

  // Get current plan details
  const getCurrentPlan = () => {
    if (!subscription) return null;
    return PRICING_PLANS[subscription.plan_type];
  };

  // Check if user can access premium features
  // Companies can always access candidate profiles (no paywall)
  const canAccessPremium = () => {
    // Companies can always view candidate profiles
    return true;
  };

  // Check if user is on trial
  const isOnTrial = () => {
    return subscription && subscription.status === 'trialing';
  };

  // Get days remaining in current period
  const getDaysRemaining = () => {
    if (!subscription) return 0;
    
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // Load subscription on mount and user change
  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    error,
    fetchSubscription,
    createSubscription,
    updateSubscriptionStatus,
    cancelSubscription,
    hasActiveSubscription,
    getCurrentPlan,
    canAccessPremium,
    isOnTrial,
    getDaysRemaining,
    refetch: fetchSubscription,
  };
};

export default useSubscription;
