
import { createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useAuthService } from "@/hooks/useAuthService";
import { useAuthListener } from "@/hooks/useAuthListener";

type UserType = 'candidate' | 'company';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: UserType, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    signIn,
    signUp,
    signOut
  } = useAuthService();
  
  // Use the auth listener hook
  useAuthListener(setSession, setUser, setLoading);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
