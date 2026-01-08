
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export async function toggleLike(
  matchId: string, 
  liked: boolean, 
  userType: 'candidate' | 'company' | null,
  matches: any[],
  setMatches: (matches: any[]) => void
) {
  const { toast } = useToast();
  
  try {
    const updateField = userType === 'candidate' ? 'candidate_liked' : 'company_liked';
    
    const { error } = await supabase
      .from("job_matching")
      .update({ [updateField]: liked })
      .eq("id", matchId);
      
    if (error) throw error;
    
    // Verifica se è stato creato un match completo
    const { data: updatedMatch, error: matchError } = await supabase
      .from("job_matching")
      .select("*")
      .eq("id", matchId)
      .single();
      
    if (matchError) throw matchError;
    
    // Update local state
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, [updateField]: liked } 
        : match
    ));
    
    // Verifica se entrambi hanno messo like e mostra un messaggio appropriato
    if (liked && updatedMatch.candidate_liked && updatedMatch.company_liked) {
      toast({
        title: "Match confermato!",
        description: "Entrambi avete espresso interesse. Ora potete contattarvi.",
      });
      
      // Aggiorna lo stato del match a "matched"
      const { error: updateError } = await supabase
        .from("job_matching")
        .update({ 
          match_status: 'matched',
          match_date: new Date().toISOString()
        })
        .eq("id", matchId);
        
      if (updateError) throw updateError;
      
      // Aggiorna lo stato locale
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { 
              ...match, 
              [updateField]: liked,
              match_status: 'matched',
              match_date: new Date().toISOString()
            } 
          : match
      ));
    } else {
      toast({
        title: liked ? "Like aggiunto" : "Like rimosso",
        description: liked 
          ? "Hai aggiunto un like a questo profilo" 
          : "Hai rimosso il like da questo profilo",
      });
    }
    
    return true;
  } catch (error: any) {
    console.error("Error updating like:", error);
    toast({
      title: "Errore",
      description: "Impossibile aggiornare il like",
      variant: "destructive",
    });
    return false;
  }
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  message: string
) {
  try {
    const { error } = await supabase
      .from("messages")
      .insert({
        job_matching_id: matchId,
        sender_id: senderId,
        message,
        is_read: false
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
}

export async function markMessagesAsRead(
  matchId: string,
  recipientId: string
) {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("job_matching_id", matchId)
      .neq("sender_id", recipientId)
      .eq("is_read", false);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return false;
  }
}
