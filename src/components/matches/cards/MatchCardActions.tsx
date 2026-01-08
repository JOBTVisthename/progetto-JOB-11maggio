
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle } from "lucide-react";

interface MatchCardActionsProps {
  isLiked: boolean;
  isMatched: boolean;
  unreadCount: number;
  onLikeToggle: () => void;
  onOpenMessages: () => void;
  isCandidate: boolean;
  isPending: boolean;
  onConfirmMatch?: () => void;
}

export default function MatchCardActions({
  isLiked,
  isMatched,
  unreadCount,
  onLikeToggle,
  onOpenMessages,
  isCandidate,
  isPending,
  onConfirmMatch,
}: MatchCardActionsProps) {
  return (
    <div className="flex justify-between">
      <Button
        variant={isLiked ? "default" : "outline"}
        className={isLiked ? "bg-jobtv-gradient" : ""}
        size="sm"
        onClick={onLikeToggle}
      >
        <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
        {isLiked ? "Mi Piace" : "Aggiungi Like"}
      </Button>

      {isPending && isCandidate && onConfirmMatch && (
        <Button
          variant="default"
          className="bg-green-500 hover:bg-green-600"
          size="sm"
          onClick={onConfirmMatch}
        >
          Conferma Match
        </Button>
      )}

      {isMatched && (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenMessages}
          className="relative"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Invia Messaggio
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}
