import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { getInitials } from "../matches/utils/matchUtils";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  is_read: boolean;
  job_matching_id: string;
}

interface MessageListProps {
  matchId: string;
  otherUser: any;
  userType: 'candidate' | 'company' | null;
}

export default function MessageList({ matchId, otherUser, userType }: MessageListProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("job_matching_id", matchId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i messaggi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || messages.length === 0) return;

    const unreadMessages = messages.filter(
      msg => !msg.is_read && msg.sender_id !== user.id
    );

    if (unreadMessages.length === 0) return;

    const messageIds = unreadMessages.map(msg => msg.id);

    // Optimistic update
    setMessages(prev =>
      prev.map(msg =>
        messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
      )
    );

    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", messageIds);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Initial fetch and Realtime subscription
  useEffect(() => {
    if (!matchId || !user) return;

    fetchMessages();

    setConnectionStatus('connecting');
    const channel = supabase
      .channel(`messages-match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events to handle updates/inserts appropriately
          schema: 'public',
          table: 'messages',
          filter: `job_matching_id=eq.${matchId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            // Play sound if not from self
            if (newMsg.sender_id !== user.id) {
              new Audio('/notification.mp3').play().catch(() => { });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as Message;
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        } else if (status === 'TIMED_OUT') {
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user]);

  // Mark read when messages change
  useEffect(() => {
    markMessagesAsRead();
  }, [messages.length, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msgToSend = newMessage.trim();
    setNewMessage(""); // Optimistic clear

    // Optimistic update - add message immediately to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      job_matching_id: matchId,
      sender_id: user.id,
      message: msgToSend,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          job_matching_id: matchId,
          sender_id: user.id,
          message: msgToSend,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temporary message with real one from server
      setMessages(prev =>
        prev.map(msg => msg.id === tempId ? data : msg)
      );
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive",
      });
      setNewMessage(msgToSend); // Restore input if failed
      // Remove temporary message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const getMessageSender = (senderId: string) => {
    return senderId === user?.id ? "Tu" : userType === 'candidate' ? otherUser?.company_name : `${otherUser?.first_name} ${otherUser?.last_name}`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Caricamento messaggi...</div>;
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[70vh]">
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage
                src={userType === 'candidate' ? otherUser?.logo_url : undefined}
                alt={userType === 'candidate'
                  ? otherUser?.company_name
                  : `${otherUser?.first_name} ${otherUser?.last_name}`}
              />
              <AvatarFallback>
                {userType === 'candidate'
                  ? getInitials(otherUser?.company_name)
                  : getInitials(`${otherUser?.first_name} ${otherUser?.last_name}`)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">
                {userType === 'candidate'
                  ? otherUser?.company_name
                  : `${otherUser?.first_name} ${otherUser?.last_name}`}
              </h3>
              <p className="text-sm text-gray-500">Chat match</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {connectionStatus === 'connecting' && (
              <div className="flex items-center text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1 animate-pulse" />
                Connessione...
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="flex items-center text-green-600 text-sm">
                <Wifi className="h-4 w-4 mr-1" />
                Online
              </div>
            )}
            {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
              <div className="flex items-center text-red-600 text-sm">
                <WifiOff className="h-4 w-4 mr-1" />
                Offline
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            Nessun messaggio. Inizia la conversazione!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${message.sender_id === user?.id
                  ? 'bg-jobtv-gradient text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}
              >
                <div className="text-sm font-medium opacity-90">{getMessageSender(message.sender_id)}</div>
                <div className="mt-1">{message.message}</div>
                <div className={`text-xs mt-1 flex justify-end items-center ${message.sender_id === user?.id
                  ? 'text-white/80'
                  : 'text-gray-500'
                  }`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: it })}
                  {message.sender_id === user?.id && (
                    <span className="ml-2 font-bold">
                      {message.is_read ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2 bg-white">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Scrivi un messaggio..."
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newMessage.trim()}
          className="bg-jobtv-gradient"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
