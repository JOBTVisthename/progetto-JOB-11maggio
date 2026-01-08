
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUnreadMessagesCount } from "@/components/matches/utils/messageUtils";

export function useMatchMessages(matchId: string, isMatched: boolean, userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  // Get unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isMatched && userId) {
        const count = await getUnreadMessagesCount(matchId, userId);
        setUnreadCount(count);
      }
    };
    
    fetchUnreadCount();
    
    // Set up real-time subscription for new messages
    if (isMatched && userId) {
      const channel = supabase
        .channel('unread-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `job_matching_id=eq.${matchId}`
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
  }, [matchId, isMatched, userId]);

  return {
    unreadCount,
    isMessagesOpen,
    setIsMessagesOpen
  };
}
