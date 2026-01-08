
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that listens for auth state changes and handles redirects
 * Note: Redirects are handled by the component that uses this hook
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

        // Store the auth event for components to handle
        if (event === 'SIGNED_IN') {
          // Component will handle redirect based on user type
          console.log('User signed in');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
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
