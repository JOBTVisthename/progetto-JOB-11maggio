import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  action?: "candidate" | "company";
  links?: { text: string; href: string }[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationState, setConversationState] = useState<"initial" | "candidate" | "company">("initial");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatico ai nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Apri il chatbot da altre pagine con un evento custom
  useEffect(() => {
    const handleOpenChatBot = (event: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (event?.detail?.message) {
        setMessages([
          {
            id: `bot-${Date.now()}`,
            text: event.detail.message,
            sender: "bot",
          },
        ]);
      }
    };

    window.addEventListener('openChatBot', handleOpenChatBot);
    return () => window.removeEventListener('openChatBot', handleOpenChatBot);
  }, []);

  // Inizializza il chatbot quando si apre
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "Ciao! 👋 Sono JOBBOLO, l'assistente virtuale di JobTV.\n\nCome posso aiutarti oggi?",
          "initial"
        );
      }, 500);
    }
  }, [isOpen, messages.length]);

  const addBotMessage = (text: string, state?: string) => {
    const newMessage: Message = {
      id: `bot-${Date.now()}`,
      text,
      sender: "bot",
      action: state as any
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: "user"
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleCandidateClick = () => {
    addUserMessage("Sono un candidato");
    setConversationState("candidate");
    setTimeout(() => {
      addBotMessage(
        "Fantastico! 🎯\n\nSono qui per guidarti nel tuo percorso di ricerca del lavoro.\n\nSu JobTV puoi:\n\n✅ Creare un profilo professionale completo\n✅ Registrare brevi video di presentazione (è fondamentale! Le aziende così ti conoscono meglio)\n✅ Rispondere a semplici domande mentre sei vestito da colloquio - rilassati, non devi preoccuparti\n✅ Ricevere proposte dalle aziende in target per te\n✅ Iniziare a comunicare direttamente con loro\n\nSei pronto a iniziare? I tuoi video sono la chiave per farti scoprire dalle aziende giuste!",
        "candidate"
      );
    }, 500);
  };

  const handleCompanyClick = () => {
    addUserMessage("Sono un'azienda");
    setConversationState("company");
    setTimeout(() => {
      addBotMessage(
        "Eccellente! 🚀\n\nBenvenuto nel futuro del recruiting!\n\nSu JobTV le aziende come la tua possono:\n\n✅ Cercare nel database di candidati pre-qualificati\n✅ Creare e pubblicare le tue offerte di lavoro\n✅ Registrare un VIDEO della tua ricerca di personale (questo è fondamentale! Solo così capiamo cosa cerchi veramente e possiamo filtrare i candidati perfetti per te)\n✅ Ricevere like dai candidati in target che corrispondono al tuo profilo\n✅ Contattare direttamente i candidati che ti interessano\n\n💰 NON paghi nulla fino a quando non scegli un candidato e decidi di pagargli il primo mese di lavoro.\n\nInitiamo subito? Il tuo video è essenziale per trovare i migliori talenti!",
        "company"
      );
    }, 500);
  };

  const handleStartNow = (type: "candidate" | "company") => {
    if (type === "candidate") {
      addUserMessage("Sì, voglio registrare il mio video!");
      addBotMessage("Perfetto! 🎬\n\nTi sto portando alla registrazione...");
    } else {
      addUserMessage("Sì, voglio mettere la mia offerta!");
      addBotMessage("Fantastico! 💼\n\nTi sto portando alla registrazione della tua offerta...");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue("");

    // Risposte automatiche basate su parole chiave
    setTimeout(() => {
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes("candidato") || lowerMessage.includes("lavoro")) {
        handleCandidateClick();
      } else if (lowerMessage.includes("azienda") || lowerMessage.includes("aziende")) {
        handleCompanyClick();
      } else if (lowerMessage.includes("registra") || lowerMessage.includes("inizia")) {
        if (conversationState === "candidate") {
          handleStartNow("candidate");
        } else if (conversationState === "company") {
          handleStartNow("company");
        }
      } else {
        addBotMessage(
          "Non sono sicuro di aver capito bene. 🤔\n\nSei un candidato in cerca di lavoro o un'azienda che vuole assumere?"
        );
      }
    }, 600);
  };

  return (
    <>
      {/* Chatbot Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-jobtv-teal to-jobtv-blue text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 animate-bounce"
          aria-label="Apri chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Minimized Chatbot */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 w-72 rounded-full bg-white/95 border border-gray-200 shadow-xl backdrop-blur-md flex items-center justify-between px-4 py-3 gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">JOBBOLO 🤖</p>
            <p className="text-xs text-gray-500">Clicca per riaprire</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="text-jobtv-blue hover:text-jobtv-teal"
              aria-label="Ripristina chatbot"
            >
              ▲
            </button>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-900"
              aria-label="Chiudi chatbot"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Chatbot Window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[32rem] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-jobtv-teal to-jobtv-blue text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">JOBBOLO 🤖</h3>
              <p className="text-xs text-white/80">Assistente Virtuale di JobTV</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Riduci chatbot"
              >
                −
              </button>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Chiudi chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    msg.sender === "bot"
                      ? "bg-white text-gray-800 border border-gray-200 shadow-sm"
                      : "bg-gradient-to-r from-jobtv-teal to-jobtv-blue text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {/* Azioni Bot */}
                  {msg.sender === "bot" && msg.action === "initial" && (
                    <div className="mt-4 space-y-2 flex flex-col">
                      <Button
                        onClick={handleCandidateClick}
                        className="bg-jobtv-teal hover:bg-jobtv-teal/90 text-white text-sm w-full"
                      >
                        👤 Sono un Candidato
                      </Button>
                      <Button
                        onClick={handleCompanyClick}
                        className="bg-jobtv-blue hover:bg-jobtv-blue/90 text-white text-sm w-full"
                      >
                        🏢 Sono un'Azienda
                      </Button>
                    </div>
                  )}

                  {/* CTA per candidati */}
                  {msg.sender === "bot" && msg.action === "candidate" && (
                    <div className="mt-4">
                      <Button
                        asChild
                        onClick={() => handleStartNow("candidate")}
                        className="bg-gradient-to-r from-jobtv-teal to-jobtv-blue hover:opacity-90 text-white text-sm w-full"
                      >
                        <Link to="/register">
                          🎬 INIZIA ORA - Registra il Tuo Video
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* CTA per aziende */}
                  {msg.sender === "bot" && msg.action === "company" && (
                    <div className="mt-4">
                      <Button
                        asChild
                        onClick={() => handleStartNow("company")}
                        className="bg-gradient-to-r from-jobtv-teal to-jobtv-blue hover:opacity-90 text-white text-sm w-full"
                      >
                        <Link to="/register">
                          💼 INIZIA ORA - Crea la Tua Offerta
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 flex gap-2 bg-white"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digita un messaggio..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-jobtv-teal text-sm"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-jobtv-teal to-jobtv-blue text-white p-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={!inputValue.trim()}
              aria-label="Invia messaggio"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
