import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Search, ArrowLeft, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import MessageList from "@/components/messages/MessageList";
import { getInitials } from "@/components/matches/utils/matchUtils";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageLayout from "@/components/layout/PageLayout";

type UserType = 'candidate' | 'company' | null;

interface Match {
  id: string;
  candidate_id: string;
  company_id: string;
  status: string;
  created_at: string;
  candidate_profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_image_url: string | null;
  };
  company_profiles?: {
    id: string;
    company_name: string | null;
    logo_url: string | null;
  };
}

interface LastMessage {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  is_read: boolean;
}

interface Conversation extends Match {
  lastMessage?: LastMessage;
  unreadCount?: number;
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<UserType>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // Fetch user type
  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setUserType(data.user_type as UserType);
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    };

    fetchUserType();
  }, [user]);

  // Fetch conversations
  useEffect(() => {
    if (!user || !userType) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        // Fetch matches with profiles
        const columnName = userType === 'candidate' ? 'candidate_id' : 'company_id';
        const { data: matches, error } = await supabase
          .from("job_matching")
          .select(`
            id,
            candidate_id,
            company_id,
            status,
            created_at,
            candidate_profiles (
              id,
              first_name,
              last_name,
              profile_image_url
            ),
            company_profiles (
              id,
              company_name,
              logo_url
            )
          `)
          .eq(columnName, user.id)
          .in('match_status', ['pending', 'accepted', 'rejected'])
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch last message for each match
        const matchIds = matches?.map(m => m.id) || [];
        const { data: messages } = await supabase
          .from("messages")
          .select("job_matching_id, message, created_at, sender_id, is_read, id")
          .in("job_matching_id", matchIds)
          .order("created_at", { ascending: false });

        // Group messages by match and get the last one
        const lastMessagesByMatch = new Map<string, LastMessage>();
        messages?.forEach((msg: any) => {
          if (!lastMessagesByMatch.has(msg.job_matching_id)) {
            lastMessagesByMatch.set(msg.job_matching_id, msg);
          }
        });

        // Count unread messages
        const unreadByMatch = new Map<string, number>();
        messages?.forEach((msg: any) => {
          if (!msg.is_read && msg.sender_id !== user.id) {
            unreadByMatch.set(
              msg.job_matching_id,
              (unreadByMatch.get(msg.job_matching_id) || 0) + 1
            );
          }
        });

        // Combine matches with last messages
        const conversationsWithLast = matches?.map(match => ({
          ...match,
          lastMessage: lastMessagesByMatch.get(match.id),
          unreadCount: unreadByMatch.get(match.id) || 0
        })) || [];

        // Sort by last message time, then by match creation time
        conversationsWithLast.sort((a, b) => {
          const aTime = a.lastMessage?.created_at || a.created_at;
          const bTime = b.lastMessage?.created_at || b.created_at;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

        setConversations(conversationsWithLast);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, userType]);

  // Gestione apertura automatica chat da parametro URL
  useEffect(() => {
    const matchId = searchParams.get("matchId");
    if (matchId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === matchId);
      if (conversation) {
        handleSelectConversation(conversation);
      }
    }
  }, [searchParams, conversations]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const matchIds = conversations.map(c => c.id);
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `job_matching_id=in.(${matchIds.join(',')})`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          // Update the conversation's last message
          setConversations(prev => {
            const updated = prev.map(conv => {
              if (conv.id === newMsg.job_matching_id) {
                return {
                  ...conv,
                  lastMessage: newMsg,
                  unreadCount: newMsg.sender_id !== user.id
                    ? (conv.unreadCount || 0) + 1
                    : conv.unreadCount
                };
              }
              return conv;
            });
            // Re-sort to bring the updated conversation to top
            return updated.sort((a, b) => {
              const aTime = a.lastMessage?.created_at || a.created_at;
              const bTime = b.lastMessage?.created_at || b.created_at;
              return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversations]);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedMatch(conversation);

    // Set other user info based on user type
    if (userType === 'candidate') {
      setOtherUser(conversation.company_profiles);
    } else {
      setOtherUser(conversation.candidate_profiles);
    }

    // Reset unread count
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversation.id
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const getOtherUserName = (conversation: Conversation) => {
    if (userType === 'candidate') {
      return conversation.company_profiles?.company_name || 'Azienda';
    } else {
      const firstName = conversation.candidate_profiles?.first_name || '';
      const lastName = conversation.candidate_profiles?.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Candidato';
    }
  };

  const getOtherUserAvatar = (conversation: Conversation) => {
    if (userType === 'candidate') {
      return conversation.company_profiles?.logo_url;
    } else {
      return conversation.candidate_profiles?.profile_image_url;
    }
  };

  const getOtherUserInitials = (conversation: Conversation) => {
    const name = getOtherUserName(conversation);
    return getInitials(name);
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getOtherUserName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
        <Header />
        <main className="section-padding">
          <div className="container container-padding text-center">
            <h1 className="text-2xl font-bold mb-4">Accedi per vedere i tuoi messaggi</h1>
            <Button onClick={() => window.location.href = '/login'}>Accedi</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <Header />
      <main className="section-padding">
        <div className="container container-padding">
          <div className="mb-6">
            <h1 className="text-3xl font-bold gradient-text">Messaggi</h1>
            <p className="text-gray-600 mt-2">Comunica con i tuoi match</p>
          </div>

          <Card className="h-[calc(100vh-200px)] min-h-[600px] flex overflow-hidden">
            {/* Conversations List */}
            <div className={`${selectedMatch && isMobileView ? 'hidden' : 'w-full md:w-80'} ${selectedMatch ? 'hidden md:flex md:flex-col' : 'flex'} border-r bg-white flex-col`}>
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca conversazioni..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jobtv-teal"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? 'Nessuna conversazione trovata' : 'Nessuna conversazione ancora'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b text-left ${
                        selectedMatch?.id === conversation.id ? 'bg-jobtv-teal/5 border-l-4 border-l-jobtv-teal' : ''
                      }`}
                    >
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={getOtherUserAvatar(conversation)} alt={getOtherUserName(conversation)} />
                        <AvatarFallback className="bg-jobtv-gradient text-white">
                          {getOtherUserInitials(conversation)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{getOtherUserName(conversation)}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {conversation.lastMessage
                              ? formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true, locale: it })
                              : formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true, locale: it })
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.message || 'Inizia la conversazione...'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-jobtv-teal text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center flex-shrink-0">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${!selectedMatch ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50`}>
              {!selectedMatch ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Seleziona una conversazione
                    </h3>
                    <p className="text-gray-600">
                      Scegli una conversazione dalla lista per iniziare a chattare
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mobile back button */}
                  {isMobileView && (
                    <div className="md:hidden p-4 border-b bg-white flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedMatch(null)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getOtherUserAvatar(selectedMatch)} />
                        <AvatarFallback>{getOtherUserInitials(selectedMatch)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium truncate">{getOtherUserName(selectedMatch)}</span>
                    </div>
                  )}

                  <MessageList
                    matchId={selectedMatch.id}
                    otherUser={otherUser}
                    userType={userType}
                  />
                </>
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
