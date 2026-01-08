
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type UserType = 'candidate' | 'company' | null;

export function useMatches(userId: string | undefined, userType: UserType) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!userId || !userType) return;
      
      try {
        let query;
        
        if (userType === 'candidate') {
          query = supabase
            .from("job_matching")
            .select(`
              *,
              company:company_id (
                id,
                company_name,
                industry,
                logo_url
              )
            `)
            .eq("candidate_id", userId);
        } else {
          query = supabase
            .from("job_matching")
            .select(`
              *,
              candidate:candidate_id (
                id,
                first_name,
                last_name,
                desired_job_title
              )
            `)
            .eq("company_id", userId);
        }
        
        const { data, error } = await query.order("created_at", { ascending: false });
        
        if (error) throw error;
        setMatches(data || []);
      } catch (error: any) {
        console.error("Error fetching matches:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i match",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (userId && userType) {
      fetchMatches();
    }
  }, [userId, userType, toast]);

  return { matches, loading, setMatches };
}
