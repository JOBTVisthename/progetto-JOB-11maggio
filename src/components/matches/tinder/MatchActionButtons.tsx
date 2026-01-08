
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MessageCircle } from "lucide-react";

interface MatchActionButtonsProps {
  handleSwipe: (direction: 'right' | 'left') => void;
  isLiked: boolean;
  isMatched: boolean;
  unreadCount: number;
  onOpenMessages: () => void;
  currentIndex: number;
  totalMatches: number;
}

export default function MatchActionButtons({ 
  handleSwipe, 
  isLiked, 
  isMatched, 
  unreadCount, 
  onOpenMessages,
  currentIndex,
  totalMatches
}: MatchActionButtonsProps) {
  return (
    <>
      <div className="flex justify-center mt-8 gap-8">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full h-16 w-16 flex items-center justify-center"
          onClick={() => handleSwipe('left')}
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>
        
        <Button
          variant={isLiked ? "default" : "outline"}
          className={`rounded-full h-16 w-16 flex items-center justify-center ${isLiked ? "bg-jobtv-gradient" : ""}`}
          size="lg"
          onClick={() => handleSwipe('right')}
        >
          <Heart className={`h-8 w-8 ${isLiked ? "fill-white text-white" : "text-pink-500"}`} />
        </Button>
        
        {isMatched && (
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full h-16 w-16 flex items-center justify-center relative"
            onClick={onOpenMessages}
          >
            <MessageCircle className="h-8 w-8 text-blue-500" />
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
      
      <div className="mt-4 text-center text-sm text-gray-500">
        {currentIndex + 1} di {totalMatches} profili
      </div>
    </>
  );
}
