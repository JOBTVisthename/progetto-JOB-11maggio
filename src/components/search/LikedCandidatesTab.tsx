
import { Loader2 } from "lucide-react";
import CandidateSearchResults from "./CandidateSearchResults";

interface LikedCandidatesTabProps {
  loading: boolean;
  candidates: any[];
  likedCandidates: string[];
  onToggleLike: (candidateId: string) => void;
  hasVideoFilter?: boolean;
}

export default function LikedCandidatesTab({
  loading,
  candidates,
  likedCandidates,
  onToggleLike,
  hasVideoFilter
}: LikedCandidatesTabProps) {
  // No need to filter here as we are passing the profile list directly
  const likedCandidatesList = candidates;

  return (
    <>
      {loading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-jobtv-teal" />
        </div>
      ) : (
        <CandidateSearchResults
          candidates={likedCandidatesList}
          likedCandidates={likedCandidates}
          onToggleLike={onToggleLike}
          showOnlyLiked
          hasVideoFilter={hasVideoFilter}
          totalCount={likedCandidatesList.length}
        />
      )}
    </>
  );
}
