
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchCandidatesTab from "@/components/search/SearchCandidatesTab";
import LikedCandidatesTab from "@/components/search/LikedCandidatesTab";
import { useCandidateSearch } from "@/hooks/useCandidateSearch";
import { Search, Heart, Sparkles } from "lucide-react";

const CandidateSearch = () => {
  const [currentFilters, setCurrentFilters] = useState<any>({});

  const {
    candidates,
    loading,
    likedCandidates,
    likedCandidatesProfiles,
    handleSearch,
    handleToggleLike,
    totalCount,
    currentPage,
    itemsPerPage
  } = useCandidateSearch();

  const handleSearchWithFilters = (filters: any, page?: number) => {
    setCurrentFilters(filters);
    handleSearch(filters, page);
  };

  return (
    <PageLayout>
      <div className="bg-gray-50/50 min-h-screen pb-12">
        <div className="bg-white border-b border-gray-100 shadow-sm mb-8">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-jobtv-teal" />
                  Talent Discovery
                </h1>
                <p className="text-gray-500 mt-2">
                  Trova il candidato perfetto tra migliaia di profili qualificati
                </p>
              </div>
              {/* Placeholder for future Quick Stats or similar */}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="search" className="w-full">
              <div className="flex items-center justify-center mb-8">
                <TabsList className="grid w-full max-w-lg grid-cols-2 p-1 bg-white border shadow-sm rounded-xl h-auto">
                  <TabsTrigger
                    value="search"
                    className="data-[state=active]:bg-jobtv-gradient data-[state=active]:text-white py-3 rounded-lg text-base font-medium transition-all"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Ricerca
                  </TabsTrigger>
                  <TabsTrigger
                    value="liked"
                    className="data-[state=active]:bg-jobtv-gradient data-[state=active]:text-white py-3 rounded-lg text-base font-medium transition-all"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Preferiti <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">{likedCandidates.length}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="search" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                <SearchCandidatesTab
                  loading={loading}
                  candidates={candidates}
                  likedCandidates={likedCandidates}
                  onToggleLike={handleToggleLike}
                  onSearch={handleSearchWithFilters}
                  hasVideoFilter={currentFilters.hasVideo}
                  totalCount={totalCount}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              </TabsContent>

              <TabsContent value="liked" className="focus-visible:outline-none focus-visible:ring-0">
                <LikedCandidatesTab
                  loading={loading}
                  candidates={likedCandidatesProfiles}
                  likedCandidates={likedCandidates}
                  onToggleLike={handleToggleLike}
                  hasVideoFilter={currentFilters.hasVideo}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CandidateSearch;
