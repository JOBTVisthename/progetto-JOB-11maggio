import { supabase } from "@/integrations/supabase/client";

/**
 * Aggiorna lo stato del like nel database e verifica se si è creato un match.
 */
export async function toggleLike(
  matchId: string, 
  liked: boolean, 
  userType: 'candidate' | 'company' | null
) {
  const updateField = userType === 'candidate' ? 'candidate_liked' : 'company_liked';
  
  // Aggiorna il like e recupera i dati aggiornati in un'unica chiamata atomica
  const { data: updatedMatch, error: updateError } = await supabase
    .from("job_matching")
    .update({ [updateField]: liked } as any)
    .eq("id", matchId)
    .select()
    .single();

  if (updateError) throw updateError;
  
  // Notifica il "like" iniziale (solo se è un nuovo like)
  if (liked) {
    // Chiamata asincrona alla Edge Function per inviare la mail di notifica like
    // Non usiamo 'await' qui se non vogliamo bloccare l'interfaccia utente durante l'invio
    supabase.functions.invoke('send-match-email', {
      body: { 
        matchId, 
        type: 'new_like', 
        senderType: userType 
      }
    }).catch(err => console.error("Errore invio mail like:", err));
  }

  // Verifica se è stato creato un match completo (interesse reciproco)
  if (liked && updatedMatch.candidate_liked && updatedMatch.company_liked && updatedMatch.match_status !== 'matched') {
    const { data: finalMatch, error: matchError } = await supabase
      .from("job_matching")
      .update({ 
        match_status: 'matched',
        match_date: new Date().toISOString()
      })
      .eq("id", matchId)
      .select()
      .single();
      
    if (matchError) throw matchError;

    // Notifica il match confermato a entrambi
    supabase.functions.invoke('send-match-email', {
      body: { 
        matchId, 
        type: 'confirmed_match' 
      }
    }).catch(err => console.error("Errore invio mail match:", err));

    return { data: finalMatch, isNewMatch: true };
  }
  
  return { data: updatedMatch, isNewMatch: false };
}

/**
 * Invia un nuovo messaggio per un match specifico.
 */
export async function sendMessage(matchId: string, senderId: string, text: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: senderId,
      message_text: text
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Recupera lo storico dei messaggi per un match.
 */
export async function getMessages(matchId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Sottoscrive ai cambiamenti in tempo reale della tabella messaggi per un match.
 */
export function subscribeToMessages(matchId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`match_messages_${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}