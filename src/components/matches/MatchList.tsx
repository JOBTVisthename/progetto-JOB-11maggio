
import MatchListCard from "./cards/MatchListCard";
import MatchTinderCard from "./cards/MatchTinderCard";
import EmptyMatchState from "./EmptyMatchState";

interface MatchListProps {
  matches: any[];
  userType: 'candidate' | 'company' | null;
  onLikeToggle: (matchId: string, liked: boolean) => void;
}

export default function MatchList({ matches, userType, onLikeToggle }: MatchListProps) {
  // If no matches, show empty state
  if (matches.length === 0) {
    return <EmptyMatchState userType={userType} />;
  }

  // Decide which view to use based on the current route
  const isTinderView = window.location.href.includes('all');

  return (
    <div>
      {isTinderView ? (
        <MatchTinderCard 
          matches={matches} 
          userType={userType} 
          onLikeToggle={onLikeToggle} 
        />
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchListCard 
              key={match.id}
              match={match}
              userType={userType}
              onLikeToggle={onLikeToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
