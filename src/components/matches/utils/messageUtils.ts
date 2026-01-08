
import { supabase } from "@/integrations/supabase/client";

export async function getUnreadMessagesCount(matchId: string, userId: string): Promise<number> {
  try {
    const { data, error, count } = await supabase
      .from("messages")
      .select("*", { count: 'exact' })
      .eq("job_matching_id", matchId)
      .eq("is_read", false)
      .neq("sender_id", userId);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
}
