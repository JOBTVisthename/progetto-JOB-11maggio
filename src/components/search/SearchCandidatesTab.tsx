
import { Loader2 } from "lucide-react";
import CandidateSearchForm from "./CandidateSearchForm";
import CandidateSearchResults from "./CandidateSearchResults";

interface SearchCandidatesTabProps {
  loading: boolean;
  candidates: any[];
  likedCandidates: string[];
  onToggleLike: (candidateId: string) => void;
  onSearch: (filters: any, page?: number) => void;
  hasVideoFilter?: boolean;
  totalCount?: number;
  currentPage?: number;
  itemsPerPage?: number;
}

export default function SearchCandidatesTab({
  loading,
  candidates,
  likedCandidates,
  onToggleLike,
  onSearch,
  hasVideoFilter,
  totalCount,
  currentPage,
  itemsPerPage
}: SearchCandidatesTabProps) {
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <CandidateSearchForm onSearch={onSearch} />
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-jobtv-teal" />
        </div>
      ) : (
        <CandidateSearchResults
          candidates={candidates}
          likedCandidates={likedCandidates}
          onToggleLike={onToggleLike}
          hasVideoFilter={hasVideoFilter}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          loading={loading}
          onPageChange={(page) => onSearch({}, page)}
        />
      )}
    </>
  );
}
