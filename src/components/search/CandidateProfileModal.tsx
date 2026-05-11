
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Briefcase, Calendar, ArrowUpRight, Video, Lock, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import PaywallModal from "@/components/payment/PaywallModal";

interface CandidateProfileModalProps {
  candidateId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CandidateProfileModal({ candidateId, isOpen, onClose }: CandidateProfileModalProps) {
  const { user } = useAuth();
  const { isCandidateUnlocked, unlockCandidate, getCreditsInfo } = useCredits();
  const [candidate, setCandidate] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [canView, setCanView] = useState<boolean>(false);

  useEffect(() => {
    if (candidateId && isOpen) {
      checkAccessAndFetch();
    }
  }, [candidateId, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCanView(false);
      setIsPaywallOpen(false);
      setCandidate(null);
      setInterviews([]);
      setLoading(true);
    }
  }, [isOpen]);

  const checkAccessAndFetch = async () => {
    if (!candidateId) return;

    const creditsInfo = getCreditsInfo();
    const isUnlocked = isCandidateUnlocked(candidateId);
    const isUnlimited = creditsInfo?.isUnlimited;

    // Check if user can view (unlimited or already unlocked)
    if (isUnlimited || isUnlocked) {
      setCanView(true);
      fetchCandidateData();
    } else if (!creditsInfo?.hasSubscription) {
      // No subscription - show paywall
      setCanView(false);
      setIsPaywallOpen(true);
    } else {
      // Has subscription but candidate not unlocked - show unlock option
      setCanView(false);
      setIsPaywallOpen(true);
    }
  };

  const handleUnlock = async () => {
    if (!candidateId) return;

    setIsUnlocking(true);
    try {
      const result = await unlockCandidate(candidateId);
      if (result.success) {
        setCanView(true);
        setIsPaywallOpen(false);
        fetchCandidateData();
      } else {
        console.error('Failed to unlock candidate:', result.error);
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const fetchCandidateData = async () => {
    if (!candidateId) return;
    
    setLoading(true);
    try {
      // Fetch candidate profile data
      const { data: candidateData, error: candidateError } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("id", candidateId)
        .single();
      
      if (candidateError) throw candidateError;
      
      // Fetch video interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("video_interviews")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });
      
      if (interviewsError) throw interviewsError;
      
      setCandidate(candidateData);
      setInterviews(interviewsData || []);
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "C";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non specificato";
    try {
      return new Date(dateString).toLocaleDateString("it-IT");
    } catch (e) {
      return dateString;
    }
  };

  const getVideoThumbnail = (url: string) => {
    if (!url) return null;
    
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be") 
        ? url.split("/").pop() 
        : new URLSearchParams(new URL(url).search).get("v");
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    
    return null;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-jobtv-blue" />
          </div>
        ) : candidate ? (
          <>
            <DialogHeader>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <Avatar className="h-20 w-20 border border-gray-200">
                  <AvatarImage src={candidate.profile_image_url} alt={`${candidate.first_name} ${candidate.last_name}`} />
                  <AvatarFallback className="text-xl">
                    {getInitials(candidate.first_name, candidate.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">
                    {candidate.first_name} {candidate.last_name}
                  </DialogTitle>
                  <DialogDescription className="text-base mt-1">
                    {candidate.desired_job_title || "Candidato"}
                  </DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {candidate.city && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {candidate.city}{candidate.province ? `, ${candidate.province}` : ""}
                      </Badge>
                    )}
                    {candidate.job_search_duration && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Cerca lavoro da {candidate.job_search_duration}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="profile" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Informazioni profilo</TabsTrigger>
                <TabsTrigger value="interviews">
                  Video Interviste ({interviews.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Informazioni personali</h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Nome:</span> {candidate.first_name} {candidate.last_name}
                        </p>
                        {candidate.birth_date && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Data di nascita:</span> {formatDate(candidate.birth_date)}
                          </p>
                        )}
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Paese:</span> {candidate.country || "Non specificato"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Città:</span> {candidate.city || "Non specificata"}
                          {candidate.province ? ` (${candidate.province})` : ""}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">Posizione desiderata</h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Titolo lavoro:</span> {candidate.desired_job_title || "Non specificato"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Ricerca lavoro da:</span> {candidate.job_search_duration || "Non specificato"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Preferenze di viaggio:</span> {candidate.travel_preference || "Non specificato"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Disponibilità</h3>
                      <div className="mt-2 space-y-2">
                        {candidate.available_start_date && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Disponibile dal:</span> {formatDate(candidate.available_start_date)}
                          </p>
                        )}
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Weekend:</span> {candidate.weekend_availability ? "Disponibile" : "Non disponibile"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Turni:</span> {candidate.shift_work_availability ? "Disponibile" : "Non disponibile"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Trasferimento:</span> {candidate.willing_to_relocate ? "Disponibile" : "Non disponibile"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Cambio regione:</span> {candidate.willing_to_change_region ? "Disponibile" : "Non disponibile"}
                        </p>
                      </div>
                    </div>
                    
                    {candidate.notes && (
                      <div>
                        <h3 className="font-medium text-gray-900">Note</h3>
                        <p className="mt-2 text-sm text-gray-700">{candidate.notes}</p>
                      </div>
                    )}
                    
                    {candidate.cv_url && (
                      <div>
                        <h3 className="font-medium text-gray-900">Curriculum</h3>
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          asChild
                        >
                          <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
                            Visualizza Curriculum <ArrowUpRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="interviews" className="mt-4">
                {interviews.length > 0 ? (
                  <div className="space-y-4">
                    {interviews.map((interview) => (
                      <div key={interview.id} className="border rounded-lg overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-4">
                            {interview.video_url ? (
                              <div className="relative w-full pt-[56.25%]">
                                {getVideoThumbnail(interview.video_url) ? (
                                  <img 
                                    src={getVideoThumbnail(interview.video_url)} 
                                    alt={interview.title} 
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                    <Video className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8">
                                <Video className="h-12 w-12 text-gray-400" />
                                <p className="text-sm text-gray-500 mt-2">Nessun video caricato</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="md:w-2/3 p-4">
                            <h3 className="font-medium text-lg">{interview.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(interview.created_at)}
                            </p>
                            <p className="mt-2 text-gray-700">
                              {interview.description || "Nessuna descrizione disponibile"}
                            </p>
                            
                            {interview.video_url && (
                              <Button variant="outline" size="sm" className="mt-3" asChild>
                                <a href={interview.video_url} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-2" />
                                  Visualizza Video
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <Video className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nessuna intervista disponibile</h3>
                    <p className="mt-1 text-sm text-gray-500">Questo candidato non ha ancora caricato interviste video.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Candidato non trovato</h3>
            <p className="mt-1 text-sm text-gray-500">Impossibile trovare le informazioni del candidato richiesto.</p>
          </div>
        )}
      </DialogContent>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => {
          setIsPaywallOpen(false);
          if (!canView) onClose();
        }}
        candidateId={candidateId}
        candidateName={candidate ? `${candidate.first_name} ${candidate.last_name}` : undefined}
        onUnlock={handleUnlock}
        isUnlocking={isUnlocking}
      />
    </Dialog>
  );
}
