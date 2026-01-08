import { useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type UserType = 'candidate' | 'company';

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

      // Ensure user_type is passed as a string
      const userData = {
        user_type: userType.toString(),
        ...(metadata || {})
      };

      console.log("User data being sent to Supabase:", userData);

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error("Supabase signup error:", error);
        throw error;
      }

      console.log("Sign up success:", data);

      toast({
        title: "Registrazione completata",
        description: "Controlla la tua email per confermare la registrazione.",
      });

      return data;
    } catch (error: any) {
      console.error("Error in signUp function:", error);
      toast({
        title: "Errore di registrazione",
        description: error.message || "Si è verificato un errore durante la registrazione",
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
