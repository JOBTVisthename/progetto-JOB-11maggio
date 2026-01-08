
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import MessagesDialog from "../../messages/MessagesDialog";
import MatchAvatar from "./MatchAvatar";
import MatchDetails from "./MatchDetails";
import MatchCardActions from "./MatchCardActions";
import { useMatchMessages } from "@/hooks/useMatchMessages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MatchListCardProps {
  match: any;
  userType: 'candidate' | 'company' | null;
  onLikeToggle: (matchId: string, liked: boolean) => void;
  setMatches: (matches: any[]) => void;
}

export default function MatchListCard({ match, userType, onLikeToggle, setMatches }: MatchListCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const isCandidate = userType === 'candidate';
  const otherParty = isCandidate ? match.company : match.candidate;
  const isLiked = isCandidate ? match.candidate_liked : match.company_liked;
  const isMatched = match.match_status === 'matched';
  const isPending = match.match_status === 'pending';

  const { unreadCount, isMessagesOpen, setIsMessagesOpen } = useMatchMessages(
    match.id,
    isMatched,
    user?.id
  );

  const handleConfirmMatch = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("job_matching")
        .update({ match_status: "matched" })
        .eq("id", match.id);

      if (error) throw error;

      // Fetch the current value of matches from the component's state
      // and update it directly using the spread operator
      // setMatches(prevMatches => {
      //   toast({
      //     title: "typeof prevMatches",
      //     description: typeof prevMatches,
      //   });
      //   const updatedMatches = prevMatches.map(m =>
      //     m.id === match.id ? { ...m, match_status: "matched" } : m
      //   );
      //   return updatedMatches;
      // });

      toast({
        title: "Match confermato",
        description: "Hai confermato il match con successo!",
      });
    } catch (error: any) {
      console.error("Error confirming match:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile confermare il match",
        variant: "destructive",
      });
    }
  };

  return (
    <Card key={match.id}>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 flex items-center justify-center p-6 bg-gray-50">
          <MatchAvatar
            otherParty={otherParty}
            isCandidate={isCandidate}
          />
        </div>

        <div className="md:w-3/4">
          <CardHeader>
            <MatchDetails
              match={match}
              otherParty={otherParty}
              isCandidate={isCandidate}
              userType={userType}
              isMatched={isMatched}
            />
          </CardHeader>

          <CardFooter>
            <MatchCardActions
              isLiked={isLiked}
              isMatched={isMatched}
              unreadCount={unreadCount}
              onLikeToggle={() => onLikeToggle(match.id, !isLiked)}
              onOpenMessages={() => setIsMessagesOpen(true)}
              isCandidate={isCandidate}
              isPending={isPending}
              onConfirmMatch={isPending ? handleConfirmMatch : undefined}
            />
          </CardFooter>
        </div>
      </div>

      {isMessagesOpen && (
        <MessagesDialog
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          matchId={match.id}
          otherUser={otherParty}
          userType={userType}
        />
      )}
    </Card>
  );
}
