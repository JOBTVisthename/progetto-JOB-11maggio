import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AdminUser extends Partial<User> {
  role?: string;
}

const HARDCODED_ADMIN_EMAIL = 'admin@jobtv.com';
const HARDCODED_ADMIN_PASS = 'Stocazzo1.1';
const ADMIN_SESSION_KEY = 'jobtv_admin_authenticated';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // 1. Check for hardcoded session in localStorage first
        const isHardcodedAuthenticated = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';

        if (isHardcodedAuthenticated) {
          setIsAdmin(true);
          setUser({
            email: HARDCODED_ADMIN_EMAIL,
            role: 'admin',
            id: 'hardcoded-admin-id'
          });
          setLoading(false);
          return;
        }

        // 2. Fallback to Supabase session if no hardcoded session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          if (session.user.email === HARDCODED_ADMIN_EMAIL) {
            setIsAdmin(true);
            setUser(session.user);
          } else {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle();

              setIsAdmin(profile?.role === 'admin');
              if (profile?.role === 'admin') {
                setUser(session.user);
              }
            } catch (e) {
              setIsAdmin(false);
            }
          }
        } else {
          setIsAdmin(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (localStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
          return;
        }

        if (session?.user) {
          setUser(session.user);
          if (session.user.email === HARDCODED_ADMIN_EMAIL) {
            setIsAdmin(true);
          } else {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle();

              setIsAdmin(profile?.role === 'admin');
            } catch (e) {
              setIsAdmin(false);
            }
          }
        } else {
          setIsAdmin(false);
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      if (email === HARDCODED_ADMIN_EMAIL && password === HARDCODED_ADMIN_PASS) {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setIsAdmin(true);
        const mockUser = {
          email: HARDCODED_ADMIN_EMAIL,
          role: 'admin',
          id: 'hardcoded-admin-id'
        };
        setUser(mockUser);
        return { user: mockUser, session: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile?.role !== 'admin') {
            await supabase.auth.signOut();
            throw new Error('Access denied. User is not an administrator.');
          }
          setIsAdmin(true);
          setUser(data.user);
        } catch (e) {
          await supabase.auth.signOut();
          throw new Error('Access denied. Admin verification failed.');
        }
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const logoutAdmin = async () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
  };

  return {
    isAdmin,
    loading,
    user,
    loginAsAdmin,
    logoutAdmin,
  };
};
