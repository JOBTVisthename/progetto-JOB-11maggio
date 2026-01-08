
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/layout/PageLayout";
import { useMatches, UserType } from "@/hooks/useMatches";
import LoadingState from "@/components/matches/LoadingState";
import UnauthorizedState from "@/components/matches/UnauthorizedState";
import MatchesContent from "@/components/matches/MatchesContent";

export default function Matches() {
  const { user, loading: authLoading } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);
  
  // Fetch user type
  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        setUserType(data.user_type as UserType);
      } catch (error: any) {
        console.error("Error fetching user type:", error);
      }
    };
    
    if (user) {
      fetchUserType();
    }
  }, [user]);

  const { matches, loading, setMatches } = useMatches(user?.id, userType);

  if (authLoading || (loading && user)) {
    return <LoadingState />;
  }

  if (!user) {
    return <UnauthorizedState />;
  }

  return (
    <PageLayout>
      <MatchesContent 
        matches={matches} 
        userType={userType} 
        setMatches={setMatches} 
      />
    </PageLayout>
  );
}
