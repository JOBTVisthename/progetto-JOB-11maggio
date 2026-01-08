import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CandidateSearchForm from "@/components/search/CandidateSearchForm";
import CandidateSearchResults from "@/components/search/CandidateSearchResults";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function CandidateSearchTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [likedCandidates, setLikedCandidates] = useState<string[]>([]);

  const fetchLikedCandidates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("job_matching")
        .select("candidate_id, company_liked")
        .eq("company_id", user.id)
        .eq("company_liked", true);

      if (error) throw error;

      setLikedCandidates(data.map((match) => match.candidate_id) || []);
    } catch (error) {
      console.error("Error fetching liked candidates:", error);
    }
  };

  // Load liked candidates when component mounts
  useEffect(() => {
    if (user) {
      fetchLikedCandidates();
    }
  }, [user]);

  const handleSearch = async (filters: any) => {
    setLoading(true);
    setSearchFilters(filters);

    try {
      let query = supabase
        .from("candidate_profiles")
        .select("*");

      // Apply filters
      if (filters.jobTitle) {
        query = query.ilike("desired_job_title", `%${filters.jobTitle}%`);
      }

      if (filters.location) {
        query = query.or(`city.ilike.%${filters.location}%,province.ilike.%${filters.location}%,country.ilike.%${filters.location}%`);
      }

      if (filters.availability && filters.availability !== 'any') {
        if (filters.availability === 'weekend') {
          query = query.eq("weekend_availability", true);
        } else if (filters.availability === 'shift') {
          query = query.eq("shift_work_availability", true);
        } else if (filters.availability === 'relocate') {
          query = query.eq("willing_to_relocate", true);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setCandidates(data || []);
    } catch (error: any) {
      console.error("Error searching candidates:", error);
      toast({
        title: "Errore nella ricerca",
        description: error.message || "Si è verificato un errore durante la ricerca dei candidati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (candidateId: string) => {
    if (!user) return;

    try {
      // Check if a match record already exists
      const { data: existingMatch, error: matchError } = await supabase
        .from("job_matching")
        .select("id, company_liked")
        .eq("company_id", user.id)
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (matchError) throw matchError;

      const isLiked = likedCandidates.includes(candidateId);
      
      if (existingMatch) {
        // Update existing match
        const { error } = await supabase
          .from("job_matching")
          .update({ company_liked: !isLiked })
          .eq("id", existingMatch.id);

        if (error) throw error;
      } else {
        // Create new match
        const { error } = await supabase
          .from("job_matching")
          .insert({
            company_id: user.id,
            candidate_id: candidateId,
            company_liked: true,
          });

        if (error) throw error;
      }

      // Update local state
      if (isLiked) {
        setLikedCandidates(prev => prev.filter(id => id !== candidateId));
      } else {
        setLikedCandidates(prev => [...prev, candidateId]);
      }

      toast({
        title: isLiked ? "Like rimosso" : "Like aggiunto",
        description: isLiked
          ? "Hai rimosso il like da questo candidato"
          : "Hai aggiunto un like a questo candidato",
      });
    } catch (error: any) {
      console.error("Error toggling like:", error);
      console.error("Error toggling like details:", error.details);
      console.error("Error toggling like hint:", error.hint);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <CandidateSearchForm onSearch={handleSearch} />
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-jobtv-teal" />
        </div>
      ) : (
        <CandidateSearchResults 
          candidates={candidates} 
          likedCandidates={likedCandidates}
          onToggleLike={handleToggleLike}
        />
      )}
    </div>
  );
}
