
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchList from "@/components/matches/MatchList";
import EmptyMatchState from "./EmptyMatchState";
import { UserType } from "@/hooks/useMatches";
import { toggleLike } from "./MatchService";
import { useToast } from "@/components/ui/use-toast";

interface MatchesContentProps {
  matches: any[];
  userType: UserType;
  setMatches: (matches: any[]) => void;
}

export default function MatchesContent({ matches, userType, setMatches }: MatchesContentProps) {
  const { toast } = useToast();

  const handleLikeToggle = async (matchId: string, liked: boolean) => {
    try {
      const result = await toggleLike(matchId, liked, userType);
      
      if (result.data) {
        // Aggiorna lo stato locale con i dati restituiti dal database
        setMatches(matches.map(m => m.id === matchId ? result.data : m));
        
        if (result.isNewMatch) {
          toast({
            title: "Match confermato! 🎉",
            description: "Entrambi avete espresso interesse. Ora potete contattarvi.",
          });
        } else {
          toast({
            title: liked ? "Like aggiunto" : "Like rimosso",
            description: liked 
              ? "Hai espresso interesse per questo profilo" 
              : "Hai rimosso il tuo interesse",
          });
        }
      }
    } catch (error) {
      console.error("Errore durante il like:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la preferenza.",
        variant: "destructive",
      });
    }
  };

  const pendingMatches = matches.filter(m => m.match_status === 'pending');
  const confirmedMatches = matches.filter(m => m.match_status === 'matched');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {userType === 'candidate' ? 'Match con Aziende' : 'Match con Candidati'}
        </h1>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">Scopri Nuovi Profili</TabsTrigger>
            <TabsTrigger value="pending">In Attesa ({pendingMatches.length})</TabsTrigger>
            <TabsTrigger value="matched">Match Confermati ({confirmedMatches.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <MatchList 
              matches={matches} 
              userType={userType} 
              onLikeToggle={handleLikeToggle} 
            />
          </TabsContent>
          
          <TabsContent value="pending">
            {pendingMatches.length === 0 ? (
              <EmptyMatchState 
                userType={userType} 
                title="Nessun match in attesa" 
                message="Non ci sono match in attesa di conferma" 
              />
            ) : (
              <MatchList 
                matches={pendingMatches} 
                userType={userType} 
                onLikeToggle={handleLikeToggle} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="matched">
            {confirmedMatches.length === 0 ? (
              <EmptyMatchState 
                userType={userType} 
                title="Nessun match confermato" 
                message="Non hai ancora match confermati" 
              />
            ) : (
              <MatchList 
                matches={confirmedMatches} 
                userType={userType} 
                onLikeToggle={handleLikeToggle} 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
