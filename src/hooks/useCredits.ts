import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface CreditsInfo {
  hasSubscription: boolean;
  isUnlimited: boolean;
  remaining: number | null;
  viewed: number;
  totalUnlocked: number;
  planType: 'starter' | 'builder' | 'hero' | null;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface UnlockedCandidate {
  candidate_id: string;
  unlocked_at: string;
  credits_used: number;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [creditsInfo, setCreditsInfo] = useState<CreditsInfo | null>(null);
  const [unlockedCandidates, setUnlockedCandidates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch credits information
  const fetchCreditsInfo = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_company_credits_info', {
        p_company_id: user.id
      });

      if (error) throw error;

      setCreditsInfo(data as CreditsInfo);

      // Also fetch unlocked candidates list
      await fetchUnlockedCandidates();
    } catch (err) {
      console.error('Error fetching credits info:', err);
      setError('Errore nel caricamento delle informazioni sui crediti');
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of unlocked candidates
  const fetchUnlockedCandidates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_unlocked_candidates', {
        p_company_id: user.id
      });

      if (error) throw error;

      const unlockedSet = new Set((data as UnlockedCandidate[])?.map(u => u.candidate_id) || []);
      setUnlockedCandidates(unlockedSet);
    } catch (err) {
      console.error('Error fetching unlocked candidates:', err);
    }
  };

  // Get remaining credits (null = unlimited)
  const getCreditsRemaining = (): number | null => {
    if (!creditsInfo) return null;
    if (!creditsInfo.hasSubscription) return 0;
    if (creditsInfo.isUnlimited) return null; // Unlimited
    return creditsInfo.remaining ?? 0;
  };

  // Check if a candidate is already unlocked
  const isCandidateUnlocked = (candidateId: string): boolean => {
    return unlockedCandidates.has(candidateId);
  };

  // Unlock a candidate (consumes 1 credit)
  const unlockCandidate = async (candidateId: string): Promise<{ success: boolean; alreadyUnlocked?: boolean; remaining?: number | null; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utente non autenticato' };
    }

    // Check if already unlocked
    if (isCandidateUnlocked(candidateId)) {
      return { success: true, alreadyUnlocked: true };
    }

    // Check if has subscription
    if (!creditsInfo?.hasSubscription) {
      return { success: false, error: 'Nessun abbonamento attivo' };
    }

    // Refresh credits info before checking to ensure we have latest data
    await fetchCreditsInfo();

    // Check if has credits remaining (using refreshed data)
    const remaining = getCreditsRemaining();
    if (remaining !== null && remaining <= 0) {
      return { success: false, error: 'Limite mensile raggiunto' };
    }

    try {
      // Get active subscription ID
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!subscription) {
        return { success: false, error: 'Nessun abbonamento attivo trovato' };
      }

      // Call unlock_candidate RPC function
      const { data, error } = await supabase.rpc('unlock_candidate', {
        p_company_id: user.id,
        p_candidate_id: candidateId,
        p_subscription_id: subscription.id
      });

      if (error) throw error;

      const result = data as { success: boolean; already_unlocked?: boolean; plan_type?: string; is_unlimited?: boolean; remaining?: number; message?: string };

      if (result.success) {
        // Add to unlocked set
        setUnlockedCandidates(prev => new Set(prev).add(candidateId));

        // Refresh credits info
        await fetchCreditsInfo();

        return {
          success: true,
          alreadyUnlocked: result.already_unlocked || false,
          remaining: result.is_unlimited ? null : (result.remaining ?? null)
        };
      } else {
        return { success: false, error: result.message || 'Errore durante lo sblocco' };
      }
    } catch (err) {
      console.error('Error unlocking candidate:', err);
      return { success: false, error: 'Errore durante lo sblocco del candidato' };
    }
  };

  // Get comprehensive credits information
  const getCreditsInfo = (): CreditsInfo | null => {
    return creditsInfo;
  };

  // Refresh credits data
  const refresh = async () => {
    setLoading(true);
    await fetchCreditsInfo();
  };

  // Load credits info on mount and user change
  useEffect(() => {
    fetchCreditsInfo();
  }, [user]);

  return {
    creditsInfo,
    unlockedCandidates,
    loading,
    error,
    getCreditsRemaining,
    isCandidateUnlocked,
    unlockCandidate,
    getCreditsInfo,
    refresh,
    refetch: refresh
  };
};

export default useCredits;
