
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import MatchList from "@/components/matches/MatchList";
import EmptyMatchState from "./EmptyMatchState";
import { UserType } from "@/hooks/useMatches";
import { toggleLike } from "./MatchService";

interface MatchesContentProps {
  matches: any[];
  userType: UserType;
  setMatches: (matches: any[]) => void;
}

export default function MatchesContent({ matches, userType, setMatches }: MatchesContentProps) {
  const [isNoMatchesDialogOpen, setIsNoMatchesDialogOpen] = useState(false);

  useEffect(() => {
    if (matches.length === 0) {
      setIsNoMatchesDialogOpen(true);
    }
  }, [matches.length]);

  const handleLikeToggle = async (matchId: string, liked: boolean) => {
    await toggleLike(matchId, liked, userType, matches, setMatches);
  };

  const pendingMatches = matches.filter(m => m.match_status === 'pending');
  const confirmedMatches = matches.filter(m => m.match_status === 'matched');

  return (
    <>
      <Dialog open={isNoMatchesDialogOpen} onOpenChange={setIsNoMatchesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>NESSUN CANDIDATO?</DialogTitle>
            <DialogDescription>
              REGISTRA VIDEO E METTI ANNUNCIO E VEDRAI IN QUESTA SEZIONE TUTTI I CANDIDATI GIUSTI PER TE.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end">
            <DialogClose asChild>
              <Button className="jobtv-button">Chiudi</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
