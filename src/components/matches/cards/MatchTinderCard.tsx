
import { useAuth } from "@/context/AuthContext";
import MessagesDialog from "../../messages/MessagesDialog";
import MatchCardContent from "../tinder/MatchCardContent";
import MatchActionButtons from "../tinder/MatchActionButtons";
import TinderEmptyState from "../tinder/TinderEmptyState";
import { useTinderCard } from "@/hooks/useTinderCard";

interface MatchTinderCardProps {
  matches: any[];
  userType: 'candidate' | 'company' | null;
  onLikeToggle: (matchId: string, liked: boolean) => void;
}

export default function MatchTinderCard({ matches, userType, onLikeToggle }: MatchTinderCardProps) {
  const { user } = useAuth();
  const { 
    currentIndex, 
    swipeDirection, 
    unreadCount, 
    isMessagesOpen, 
    setIsMessagesOpen, 
    handleSwipe 
  } = useTinderCard(matches, user);

  // Custom handleSwipe that includes like toggling
  const handleSwipeWithLike = (direction: 'right' | 'left') => {
    // Se swipe a destra, aggiungi like
    if (direction === 'right' && currentIndex < matches.length) {
      onLikeToggle(matches[currentIndex].id, true);
    }
    
    handleSwipe(direction);
  };

  if (matches.length === 0) {
    return <TinderEmptyState />;
  }

  if (currentIndex >= matches.length) {
    return <TinderEmptyState allSwipedType={true} />;
  }

  const match = matches[currentIndex];
  const isCandidate = userType === 'candidate';
  const otherParty = isCandidate ? match.company : match.candidate;
  const isLiked = isCandidate ? match.candidate_liked : match.company_liked;
  const isMatched = match.match_status === 'matched';

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] relative">
      <div className="w-full max-w-md relative">
        <MatchCardContent 
          match={match}
          isCandidate={isCandidate}
          otherParty={otherParty}
          isMatched={isMatched}
          swipeDirection={swipeDirection}
        />
      </div>
      
      <MatchActionButtons 
        handleSwipe={handleSwipeWithLike}
        isLiked={isLiked}
        isMatched={isMatched}
        unreadCount={unreadCount}
        onOpenMessages={() => setIsMessagesOpen(true)}
        currentIndex={currentIndex}
        totalMatches={matches.length}
      />
      
      {isMessagesOpen && (
        <MessagesDialog
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          matchId={match.id}
          otherUser={otherParty}
          userType={userType}
        />
      )}
    </div>
  );
}
