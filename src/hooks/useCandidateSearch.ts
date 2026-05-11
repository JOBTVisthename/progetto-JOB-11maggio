
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useCandidateSearch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [likedCandidates, setLikedCandidates] = useState<string[]>([]);
  const [likedCandidatesProfiles, setLikedCandidatesProfiles] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    if (user) {
      handleSearch({}, 1); // Initial search to populate all candidates
      fetchLikedCandidates();
    }
  }, [user]);

  const fetchLikedCandidates = async () => {
    if (!user) return;

    try {
      const { data: matches, error } = await supabase
        .from("job_matching")
        .select("candidate_id")
        .eq("company_id", user.id)
        .eq("company_liked", true);

      if (error) throw error;

      const ids = matches.map((match) => match.candidate_id) || [];
      setLikedCandidates(ids);

      if (ids.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("candidate_profiles")
          .select("*")
          .in("id", ids);

        if (profilesError) throw profilesError;
        setLikedCandidatesProfiles(profiles || []);
      } else {
        setLikedCandidatesProfiles([]);
      }
    } catch (error) {
      console.error("Error fetching liked candidates:", error);
    }
  };

  const handleSearch = async (filters: any, page: number = 1) => {
    setLoading(true);
    setSearchFilters(filters);
    setCurrentPage(page);

    console.log("🔍 Search filters applied:", filters);
    console.log("🎥 Has video filter:", filters.hasVideo);
    console.log("📄 Page:", page);

    try {
      let data: any[] = [];
      let error: any = null;
      let count: number = 0;

      // Build the base query
      let baseQuery = supabase.from("candidate_profiles").select("*", { count: 'exact', head: false });

      // Apply video filter if enabled
      if (filters.hasVideo) {
        console.log("🎬 Applying video filter - getting candidates with videos only");

        // First get candidates with videos
        const { data: candidatesWithVideos, error: videoError } = await supabase
          .from("video_interviews")
          .select("candidate_id")
          .not("video_url", "is", null)
          .neq("video_url", "");

        if (videoError) throw videoError;

        // Get unique candidate IDs
        const candidateIds = [...new Set(candidatesWithVideos?.map(v => v.candidate_id) || [])];

        if (candidateIds.length === 0) {
          // No candidates with videos found
          setCandidates([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        // Filter by candidate IDs
        baseQuery = baseQuery.in("id", candidateIds);
      }

      // Apply all filters to the base query
      let query = baseQuery;

      // Job Title filter
      if (filters.jobTitle) {
        query = query.ilike("desired_job_title", `%${filters.jobTitle}%`);
      }

      // Location filter (city, province, or country)
      if (filters.location) {
        query = query.or(`city.ilike.%${filters.location}%,province.ilike.%${filters.location}%,country.ilike.%${filters.location}%`);
      }

      // Availability filter
      if (filters.availability && filters.availability !== 'any') {
        if (filters.availability === 'immediate') {
          // Available immediately or within 7 days
          query = query.lte('available_start_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        } else if (filters.availability === 'weekend') {
          query = query.eq("weekend_availability", true);
        } else if (filters.availability === 'shift') {
          query = query.eq("shift_work_availability", true);
        } else if (filters.availability === 'relocate') {
          query = query.or("willing_to_relocate.eq.true,willing_to_change_region.eq.true");
        } else if (filters.availability === 'remote') {
          query = query.eq("remote_availability", true);
        }
      }

      // Experience filter (years of experience)
      if (filters.experience && filters.experience !== 'any') {
        if (filters.experience === '0-2') {
          query = query.gte('years_of_experience', 0).lte('years_of_experience', 2);
        } else if (filters.experience === '3-5') {
          query = query.gte('years_of_experience', 3).lte('years_of_experience', 5);
        } else if (filters.experience === '6-10') {
          query = query.gte('years_of_experience', 6).lte('years_of_experience', 10);
        } else if (filters.experience === '10+') {
          query = query.gte('years_of_experience', 10);
        }
      }

      // Contract Type filter
      if (filters.contractType && filters.contractType !== 'any') {
        query = query.eq("contract_type_preference", filters.contractType);
      }

      // Education Level filter
      if (filters.educationLevel && filters.educationLevel !== 'any') {
        query = query.eq("education_level", filters.educationLevel);
      }

      // Skills filter (contains any of the selected skills)
      if (filters.skills && filters.skills.length > 0) {
        query = query.contains('skills', filters.skills);
      }

      // Languages filter (contains any of the selected languages)
      if (filters.languages && filters.languages.length > 0) {
        query = query.contains('languages', filters.languages);
      }

      // Salary range filter
      if (filters.salaryMin) {
        query = query.gte('salary_expectation_max', filters.salaryMin);
      }
      if (filters.salaryMax) {
        query = query.lte('salary_expectation_min', filters.salaryMax);
      }

      // Prioritize candidates with profile photos, then by availability date
      query = query.order('profile_image_url', { ascending: false, nullsFirst: false });
      query = query.order('available_start_date', { ascending: false, nullsFirst: true });

      // Apply pagination using range
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const result = await query;
      data = result.data || [];
      error = result.error;
      count = result.count || 0;

      if (error) throw error;

      console.log("📊 Raw results from DB:", data);
      console.log("🎬 Total candidates found:", count);
      console.log("📄 Showing page", page, "with", data.length, "candidates");

      setCandidates(data);
      setTotalCount(count);
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
            match_status: "pending"
          });

        if (error) throw error;
      }

      // Update local state
      if (isLiked) {
        setLikedCandidates(prev => prev.filter(id => id !== candidateId));
        setLikedCandidatesProfiles(prev => prev.filter(p => p.id !== candidateId));
      } else {
        setLikedCandidates(prev => [...prev, candidateId]);
        // Find the candidate in current search results to add to liked profiles
        const candidateToAdd = candidates.find(c => c.id === candidateId);
        if (candidateToAdd) {
          setLikedCandidatesProfiles(prev => [...prev, candidateToAdd]);
        } else {
          // Fallback: fetch single profile if not in current list
          const { data: profile } = await supabase.from('candidate_profiles').select('*').eq('id', candidateId).single();
          if (profile) setLikedCandidatesProfiles(prev => [...prev, profile]);
        }
      }

      toast({
        title: isLiked ? "Like rimosso" : "Like aggiunto",
        description: isLiked
          ? "Hai rimosso il like da questo candidato"
          : "Hai aggiunto un like a questo candidato",
      });
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore",
        variant: "destructive",
      });
    }
  };

  return {
    candidates,
    loading,
    likedCandidates,
    likedCandidatesProfiles,
    handleSearch,
    handleToggleLike,
    totalCount,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE
  };
}
