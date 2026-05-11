import { useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// API base URL - uses environment variable or falls back to same origin (production)
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

type UserType = 'candidate' | 'company';

/**
 * Send welcome email via SMTP
 */
const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-email/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    const result = await response.json();
    console.log('Welcome email result:', result);
    return result.success;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - email failure shouldn't block registration
    return false;
  }
};

/**
 * Hook for authentication service logic
 */
export const useAuthService = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto in JobTV!",
      });
    } catch (error: any) {
      toast({
        title: "Errore di accesso",
        description: error.message || "Si è verificato un errore durante l'accesso",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userType: UserType,
    metadata?: any
  ) => {
    try {
      console.log("Attempting to sign up user:", { email, userType, metadata });

      // Prepare user metadata
      const userData = {
        user_type: userType.toString(),
        ...metadata
      };

      console.log("User data being sent to Supabase:", userData);

      // Use Supabase auth signup with emailRedirectTo disabled to avoid timeout
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: undefined, // Disable email redirect for now
        }
      });

      if (error) {
        console.error("Supabase signup error:", error);
        throw error;
      }

      console.log("Sign up success:", data);

      // Send welcome email via SMTP (non-blocking)
      const userName = metadata?.first_name || metadata?.company_name || email.split('@')[0];
      sendWelcomeEmail(email, userName).catch(err => console.log("Email failed (non-blocking):", err));

      toast({
        title: "Registrazione completata!",
        description: "Benvenuto in JobTV!",
      });

      return data;
    } catch (error: any) {
      console.error("Error in signUp function:", error);
      toast({
        title: "Errore di registrazione",
        description: error?.message || "Si è verificato un errore durante la registrazione. Riprova.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Disconnessione effettuata",
        description: "Hai effettuato il logout con successo",
      });
    } catch (error: any) {
      toast({
        title: "Errore di disconnessione",
        description: error.message || "Si è verificato un errore durante la disconnessione",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    signIn,
    signUp,
    signOut
  };
};
