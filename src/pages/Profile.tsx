
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CandidateProfile from "@/components/profile/CandidateProfile";
import CompanyProfile from "@/components/profile/CompanyProfile";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profileType, setProfileType] = useState<"candidate" | "company" | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileType = async () => {
      if (!user) return;
      
      try {
        // Fetch user profile type
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfileType(profile.user_type);
        
        // Fetch specific profile data
        if (profile.user_type === 'candidate') {
          const { data, error } = await supabase
            .from("candidate_profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (error) throw error;
          setProfileData(data);
        } else if (profile.user_type === 'company') {
          const { data, error } = await supabase
            .from("company_profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (error) throw error;
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfileType();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-jobtv-blue" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accesso Richiesto</h1>
            <p className="mb-6">Devi essere autenticato per visualizzare questa pagina.</p>
            <Button onClick={() => navigate("/login")}>Accedi</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Il tuo profilo</h1>
          
          {profileType === 'candidate' && (
            <CandidateProfile profileData={profileData} userId={user.id} />
          )}
          
          {profileType === 'company' && (
            <CompanyProfile profileData={profileData} userId={user.id} />
          )}
          
          {!profileType && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <p className="text-yellow-800">Non è stato possibile determinare il tipo di profilo.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
