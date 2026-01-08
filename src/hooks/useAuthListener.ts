
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that listens for auth state changes
 */
export const useAuthListener = (
  setSession: (session: any) => void,
  setUser: (user: any) => void,
  setLoading: (loading: boolean) => void
) => {
  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, setLoading]);
};
