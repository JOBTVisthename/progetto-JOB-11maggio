
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUnreadMessagesCount } from "@/components/matches/utils/messageUtils";

export function useTinderCard(matches: any[], user: any | null) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'right' | 'left' | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  
  const handleSwipe = (direction: 'right' | 'left') => {
    setSwipeDirection(direction);
    
    // Attendi l'animazione prima di cambiare card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };
  
  // Get unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (currentIndex < matches.length && matches[currentIndex].match_status === 'matched' && user) {
        const count = await getUnreadMessagesCount(matches[currentIndex].id, user.id);
        setUnreadCount(count);
      } else {
        setUnreadCount(0);
      }
    };
    
    fetchUnreadCount();
    
    // Set up real-time subscription for new messages
    if (currentIndex < matches.length && matches[currentIndex].match_status === 'matched' && user) {
      const channel = supabase
        .channel('unread-messages-tinder')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `job_matching_id=eq.${matches[currentIndex].id}`
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentIndex, matches, user]);
  
  return {
    currentIndex, 
    swipeDirection, 
    unreadCount, 
    isMessagesOpen,
    setIsMessagesOpen,
    handleSwipe
  };
}
