import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, User, MapPin, Calendar, Briefcase, Eye, ChevronLeft, ChevronRight, Video, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CandidateProfileModal from "./CandidateProfileModal";
import PaywallModal from "@/components/payment/PaywallModal";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useCredits } from "@/hooks/useCredits";

interface CandidateSearchResultsProps {
  candidates: any[];
  likedCandidates: string[];
  onToggleLike: (candidateId: string) => void;
  showOnlyLiked?: boolean;
  hasVideoFilter?: boolean;
  totalCount?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export default function CandidateSearchResults({
  candidates,
  likedCandidates,
  onToggleLike,
  showOnlyLiked = false,
  hasVideoFilter = false,
  totalCount = 0,
  currentPage = 1,
  itemsPerPage = 20,
  onPageChange
}: CandidateSearchResultsProps) {
  const { user } = useAuth();
  const { hasActiveSubscription, canAccessPremium } = useSubscription();
  const { isCandidateUnlocked, unlockCandidate, getCreditsInfo } = useCredits();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [selectedCandidateForPaywall, setSelectedCandidateForPaywall] = useState<any>(null);
  const [unlockingCandidateId, setUnlockingCandidateId] = useState<string | null>(null);

  const canViewFullProfiles = canAccessPremium();

  const handleViewProfile = async (candidateId: string) => {
    // Check if candidate is already unlocked
    if (isCandidateUnlocked(candidateId)) {
      setSelectedCandidateId(candidateId);
      setIsProfileModalOpen(true);
      return;
    }

    // Check if user has unlimited access (hero plan)
    const creditsInfo = getCreditsInfo();
    if (creditsInfo?.isUnlimited) {
      setSelectedCandidateId(candidateId);
      setIsProfileModalOpen(true);
      return;
    }

    // Check if has credits remaining
    if (!creditsInfo?.hasSubscription) {
      // No subscription - show paywall
      setSelectedCandidateForPaywall(candidates.find(c => c.id === candidateId) || null);
      setIsPaywallOpen(true);
      return;
    }

    // Has subscription but need to unlock candidate
    setSelectedCandidateForPaywall(candidates.find(c => c.id === candidateId) || null);
    setIsPaywallOpen(true);
  };

  const handleUnlockCandidate = async (candidateId: string) => {
    setUnlockingCandidateId(candidateId);
    try {
      const result = await unlockCandidate(candidateId);
      if (result.success) {
        // Close paywall and open profile modal
        setIsPaywallOpen(false);
        setSelectedCandidateId(candidateId);
        setIsProfileModalOpen(true);
      } else {
        // Show error or handle insufficient credits
        console.error('Failed to unlock candidate:', result.error);
      }
    } finally {
      setUnlockingCandidateId(null);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "CN";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  // Candidates are already sorted at database level (photos first, then by availability)
  // No need for client-side sorting
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Create limited preview data for paywall
  const getCandidatePreview = (candidate: any) => ({
    name: `${candidate.first_name} ${candidate.last_name}`,
    position: candidate.desired_job_title,
    location: candidate.city ? `${candidate.city}${candidate.province ? `, ${candidate.province}` : ''}` : undefined,
    experience: candidate.job_search_duration
  });

  if (candidates.length === 0) {
    return (
      <div className="text-center border rounded-md p-10 bg-white">
        <User className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Nessun candidato trovato</h3>
        <p className="mt-1 text-sm text-gray-500">
          {showOnlyLiked
            ? "Non hai ancora aggiunto like a nessun candidato"
            : "Prova a modificare i criteri di ricerca"
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const isUnlocked = isCandidateUnlocked(candidate.id);
            const creditsInfo = getCreditsInfo();
            const isBlurred = user?.user_type === 'company' && !creditsInfo?.isUnlimited && !isUnlocked;

            return (
            <Card key={candidate.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100 group flex flex-col h-full bg-white ${isBlurred ? 'relative' : ''}`}>
              {/* Overlay for blurred cards */}
              {isBlurred && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 rounded-lg" />
              )}

              {/* Header with Background/Avatar */}
              <div className="relative h-24 bg-gradient-to-r from-jobtv-teal/10 to-jobtv-blue/10">
                {candidate.video_interviews && candidate.video_interviews.length > 0 && (
                  <Badge className="absolute top-3 right-3 bg-white/90 text-jobtv-blue hover:bg-white shadow-sm backdrop-blur-sm border-0">
                    <Video className="h-3 w-3 mr-1" />
                    <span className="text-xs font-semibold">Video CV</span>
                  </Badge>
                )}
              </div>

              <div className="px-6 relative flex-grow">
                <div className={`absolute -top-12 left-6 border-4 border-white rounded-full shadow-md bg-white ${isBlurred ? 'overflow-hidden' : ''}`}>
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={candidate.profile_image_url}
                      alt={`${candidate.first_name} ${candidate.last_name}`}
                      className="object-cover"
                      style={isBlurred ? { filter: 'blur(8px)' } : {}}
                    />
                    <AvatarFallback className="text-xl bg-gray-50 text-gray-400">
                      {getInitials(candidate.first_name, candidate.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="pt-10 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="relative">
                      {isBlurred && <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded z-20" />}
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-jobtv-blue transition-colors">
                        {isBlurred
                          ? `${candidate.first_name?.charAt(0) || ''}... ${candidate.last_name?.charAt(0) || ''}...`
                          : `${candidate.first_name} ${candidate.last_name}`
                        }
                      </h3>
                      <p className="text-jobtv-teal font-medium text-sm">
                        {candidate.desired_job_title || "Candidato"}
                      </p>
                      {isBlurred && (
                        <div className="flex items-center gap-1 mt-1 text-orange-600">
                          <Lock className="h-3 w-3" />
                          <span className="text-xs font-medium">Sblocca per vedere</span>
                        </div>
                      )}
                    </div>
                    {/* Placeholder for Match Score if available */}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">
                      {candidate.city ? `${candidate.city}${candidate.province ? `, ${candidate.province}` : ''}` : 'Luogo non specificato'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{candidate.job_search_duration ? `Cerca da ${candidate.job_search_duration}` : 'In cerca attiva'}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{candidate.available_start_date ? `Dal ${new Date(candidate.available_start_date).toLocaleDateString('it-IT')}` : 'Disponibilità immediata'}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {candidate.weekend_availability && (
                    <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600 border border-gray-100 font-normal">Weekend</Badge>
                  )}
                  {candidate.shift_work_availability && (
                    <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600 border border-gray-100 font-normal">Turni</Badge>
                  )}
                  {candidate.willing_to_relocate && (
                    <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600 border border-gray-100 font-normal">Trasferta</Badge>
                  )}
                  {!candidate.weekend_availability && !candidate.shift_work_availability && !candidate.willing_to_relocate && (
                    <span className="text-xs text-gray-400 italic">Nessuna preferenza extra</span>
                  )}
                </div>
              </div>

              <CardFooter className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex gap-3 mt-auto relative z-20">
                <Button
                  variant="outline"
                  className="flex-1 hover:border-jobtv-blue hover:text-jobtv-blue bg-white"
                  onClick={() => handleViewProfile(candidate.id)}
                  disabled={unlockingCandidateId === candidate.id}
                >
                  {isBlurred ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sblocca (1 credito)
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizza
                    </>
                  )}
                </Button>
                <Button
                  variant={likedCandidates.includes(candidate.id) ? "default" : "secondary"}
                  className={`px-3 ${likedCandidates.includes(candidate.id) ? "bg-pink-500 hover:bg-pink-600 text-white" : "bg-white text-gray-400 hover:text-pink-500 border border-input"}`}
                  onClick={() => onToggleLike(candidate.id)}
                >
                  <Heart className={`h-4 w-4 ${likedCandidates.includes(candidate.id) ? "fill-current" : ""}`} />
                </Button>
              </CardFooter>
            </Card>
          );
          })}
        </div>
      </div>

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4" />
            Precedente
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center"
          >
            Successivo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Info risultati */}
      <div className="text-center text-sm text-gray-600 mb-4">
        Mostrati {candidates.length} di {totalCount} candidati
        {totalPages > 1 && ` (pagina ${currentPage} di ${totalPages})`}
      </div>

      {/* Profile Modal - Always accessible for companies */}
      {selectedCandidateId && (
        <CandidateProfileModal
          candidateId={selectedCandidateId}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        candidateId={selectedCandidateForPaywall?.id}
        candidateName={selectedCandidateForPaywall ? `${selectedCandidateForPaywall.first_name} ${selectedCandidateForPaywall.last_name}` : undefined}
        previewData={selectedCandidateForPaywall ? getCandidatePreview(selectedCandidateForPaywall) : undefined}
        onUnlock={selectedCandidateForPaywall?.id ? () => handleUnlockCandidate(selectedCandidateForPaywall.id) : undefined}
        isUnlocking={unlockingCandidateId !== null}
      />
    </>
  );
}
