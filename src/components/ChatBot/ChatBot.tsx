import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Send, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  action?: "candidate" | "company";
  links?: { text: string; href: string }[];
}

export default function ChatBot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationState, setConversationState] = useState<"initial" | "candidate" | "company">("initial");
  const [userName, setUserName] = useState<string>("");
  const [awaitingName, setAwaitingName] = useState(false);
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

      if (!user) {
        // Utente non loggato - chiedi nome e vai alla registrazione
        if (!userName) {
          setAwaitingName(true);
          addBotMessage("Perfetto! 🎬\n\nPrima di iniziare, come ti chiami? Mi serve per personalizzare la tua esperienza!");
          return;
        }

        addBotMessage(`Ottimo ${userName}! 🎬\n\nTi porto alla registrazione così potrai creare il tuo profilo e registrare il video...`);
        setTimeout(() => {
          navigate('/register/candidate');
          setIsOpen(false);
        }, 1500);
      } else {
        // Utente già loggato - vai direttamente al video
        addBotMessage("Perfetto! 🎬\n\nTi sto portando alla registrazione del video...");
        setTimeout(() => {
          navigate('/record-interview');
          setIsOpen(false);
        }, 1500);
      }
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

    // Se stiamo aspettando il nome dell'utente
    if (awaitingName) {
      setUserName(userMessage);
      setAwaitingName(false);
      addBotMessage(`Ottimo ${userMessage}! 🎬\n\nTi porto alla registrazione così potrai creare il tuo profilo e registrare il video...`);
      setTimeout(() => {
        navigate('/register/candidate');
        setIsOpen(false);
      }, 1500);
      return;
    }

    // Risposte automatiche basate su parole chiave
    setTimeout(() => {
      const lowerMessage = userMessage.toLowerCase();

      // Risposte per candidati
      const candidateResponses = [
        // Posizioni geografiche e disponibilità
        { keywords: ['offerte', 'lavoro', 'vicino', 'italia'], response: '→ Abbiamo offerte in tutta Italia.' },
        { keywords: ['milano'], response: '→ Dipende dal tipo di lavoro che cerchi.' },
        { keywords: ['bergamo', 'provincia'], response: '→ Sì, dipende dal settore e dalle aziende attive.' },
        { keywords: ['remoto', 'da remoto'], response: '→ Certo, ci sono anche lavori da remoto.' },
        { keywords: ['part time', 'part-time'], response: '→ Certo, registri il video e trovi anche offerte part time.' },
        { keywords: ['full time', 'full-time'], response: '→ Sì, trovi sia full time che part time.' },
        { keywords: ['assumendo', 'aziende'], response: '→ Dipende dal settore, ma ci sono molte aziende attive.' },

        // Registrazione e profilo
        { keywords: ['cv', 'curriculum'], response: '→ Devi registrarti, compilare il profilo e caricare il video.' },
        { keywords: ['registrarmi', 'registrazione'], response: '→ Sì, serve creare il tuo profilo.' },
        { keywords: ['profilo', 'aggiornare'], response: '→ Dal tuo profilo puoi modificare tutto.' },
        { keywords: ['candidarmi', 'candidatura'], response: '→ Ti registri, carichi CV e video, poi candidati alle offerte.' },
        { keywords: ['cellulare', 'smartphone'], response: '→ Sì, tutto funziona anche da smartphone.' },

        // Esperienza e qualifiche
        { keywords: ['senza esperienza', 'junior'], response: '→ Certo, molte aziende cercano anche junior.' },
        { keywords: ['stage', 'tirocini'], response: '→ Sì, trovi anche stage e tirocini.' },
        { keywords: ['informatico', 'it', 'digitale'], response: '→ Abbiamo offerte anche nel settore IT e digitale.' },
        { keywords: ['magazziniere', 'logistica'], response: '→ Sì, trovi offerte nella logistica e magazzino.' },
        { keywords: ['receptionist', 'turismo'], response: '→ Certo, ci sono offerte nel turismo e uffici.' },
        { keywords: ['operaio'], response: '→ Abbiamo molte richieste anche per operai.' },
        { keywords: ['studenti'], response: '→ Certo, anche lavori flessibili e weekend.' },
        { keywords: ['weekend'], response: '→ Sì, trovi offerte weekend e stagionali.' },
        { keywords: ['protette', 'categorie'], response: '→ Sì, ci sono aziende che assumono categorie protette.' },
        { keywords: ['over 50', 'anziani'], response: '→ Certo, dipende dall\'esperienza e dal ruolo.' },
        { keywords: ['stipendio'], response: '→ In alcune offerte sì.' },
        { keywords: ['richiesti', 'popolari'], response: '→ Logistica, vendita, ristorazione e IT.' },
        { keywords: ['urgenti'], response: '→ Sì, alcune aziende cercano subito.' },
        { keywords: ['estero'], response: '→ Alcune aziende pubblicano anche offerte estere.' },
        { keywords: ['documenti'], response: '→ CV aggiornato e profilo completo.' },
        { keywords: ['colloquio online'], response: '→ Sì, molte aziende fanno colloqui online.' },
        { keywords: ['preparare cv'], response: '→ Mantienilo semplice, chiaro e aggiornato.' },
        { keywords: ['lettera', 'presentazione'], response: '→ Sì, possiamo aiutarti.' },
        { keywords: ['turismo'], response: '→ Certo, soprattutto stagionali.' },
        { keywords: ['logistica'], response: '→ Sì, è uno dei settori più richiesti.' },
        { keywords: ['commesso', 'vendita'], response: '→ Abbiamo molte offerte retail e vendita.' },
        { keywords: ['neodiplomati'], response: '→ Certo, anche senza esperienza.' },
        { keywords: ['laureati'], response: '→ Sì, trovi offerte qualificate.' },
        { keywords: ['notifiche'], response: '→ Sì, tramite profilo e notifiche.' },
        { keywords: ['cancellare', 'account'], response: '→ Puoi gestirlo dalle impostazioni.' },
        { keywords: ['gratuito'], response: '→ Sì, è gratuito.' },
        { keywords: ['più offerte'], response: '→ Certo.' },
        { keywords: ['formazione'], response: '→ Alcune aziende offrono formazione.' },
        { keywords: ['selezionato'], response: '→ Ricevi aggiornamenti dalla piattaforma.' },
        { keywords: ['modificare', 'candidatura'], response: '→ Sì, prima della chiusura dell\'offerta.' },
        { keywords: ['stagionali'], response: '→ Certo, soprattutto turismo e retail.' },
        { keywords: ['sanitario'], response: '→ Sì, dipende dalla zona.' },
        { keywords: ['inglese'], response: '→ Sì, stiamo lavorando anche sul multilingua.' },
        { keywords: ['consigli'], response: '→ Completa bene profilo, CV e video.' },
        { keywords: ['video'], response: '→ Sì, aiuta le aziende a conoscerti meglio.' },
        { keywords: ['durare', 'video'], response: '→ Breve e chiaro, circa 30-60 secondi.' },
        { keywords: ['rifare', 'video'], response: '→ Certo, quando vuoi.' },
        { keywords: ['aziende vedono'], response: '→ Sì, se il profilo è completo.' },
        { keywords: ['senza cv'], response: '→ Meglio caricarlo per avere più possibilità.' },
        { keywords: ['minorenne'], response: '→ Dipende dall\'offerta e dalla legge.' },
        { keywords: ['estivi'], response: '→ Sì, molti.' },
        { keywords: ['senza esperienza'], response: '→ Certo.' },
        { keywords: ['contattare'], response: '→ Sì.' },
        { keywords: ['nascondere'], response: '→ Alcune impostazioni privacy sono disponibili.' },
        { keywords: ['marketing'], response: '→ Sì.' },
        { keywords: ['autisti'], response: '→ Certo.' },
        { keywords: ['estero', 'jobtv'], response: '→ Dipende dalle offerte disponibili.' },
        { keywords: ['senza diploma'], response: '→ Sì, dipende dal ruolo.' },
        { keywords: ['camerieri'], response: '→ Moltissime.' },
        { keywords: ['baristi'], response: '→ Sì.' },
        { keywords: ['subito'], response: '→ Certo.' },
        { keywords: ['vedono video'], response: '→ Sì, se ti candidi.' },
        { keywords: ['eliminare video'], response: '→ Sì.' },
        { keywords: ['settore'], response: '→ Certo.' },
        { keywords: ['fabbrica'], response: '→ Sì.' },
        { keywords: ['segretaria'], response: '→ Sì.' },
        { keywords: ['senza lettera'], response: '→ Sì.' },
        { keywords: ['importante video'], response: '→ Molto, aiuta a distinguerti.' },
        { keywords: ['più città'], response: '→ Certo.' },
        { keywords: ['immediate'], response: '→ Sì.' },
        { keywords: ['gratis'], response: '→ Sì.' },
        { keywords: ['trovare offerte'], response: '→ Completa bene il profilo.' },
        { keywords: ['moda'], response: '→ Sì.' },
        { keywords: ['più cv'], response: '→ Al momento uno principale.' },
        { keywords: ['chef'], response: '→ Certo.' },
        { keywords: ['pulizie'], response: '→ Sì.' },
        { keywords: ['parlare aziende'], response: '→ Dipende dall\'azienda.' },
        { keywords: ['notturne'], response: '→ Sì.' },
        { keywords: ['computer'], response: '→ Certo.' },
        { keywords: ['freelance'], response: '→ Alcuni sì.' },
        { keywords: ['personalizzate'], response: '→ Sì, in base al profilo.' },
        { keywords: ['badanti'], response: '→ Sì.' },
        { keywords: ['modificare video'], response: '→ Certo.' },
        { keywords: ['scaricare cv'], response: '→ Sì, se autorizzato.' },
        { keywords: ['ristorazione'], response: '→ Moltissime.' },
        { keywords: ['velocemente'], response: '→ Dipende dal profilo e dalle candidature.' },
        { keywords: ['senza turni'], response: '→ Sì.' },
        { keywords: ['salvare'], response: '→ Certo.' },
        { keywords: ['tecnici'], response: '→ Sì.' },
        { keywords: ['energia'], response: '→ Sì.' },
        { keywords: ['senza video'], response: '→ Meglio averlo.' },
        { keywords: ['chat'], response: '→ Sì.' },
        { keywords: ['aiuto profilo'], response: '→ Certo.' },
        { keywords: ['registro'], response: '→ Su JobTV' },

        // Tempi e supporto
        { keywords: ['tempo', 'risposta'], response: '→ Dipende dall\'azienda e dall\'offerta.' },
        { keywords: ['operatore', 'umano'], response: '→ Sì, puoi contattare il supporto.' },
        { keywords: ['serali', 'turni'], response: '→ Sì, molte offerte prevedono turni.' }
      ];

      // Risposte per aziende
      const companyResponses = [
        { keywords: ['pubblicare', 'offerta'], response: '→ Vai sul tuo profilo aziendale e pubblica l\'annuncio.' },
        { keywords: ['costa', 'prezzo'], response: '→ È gratuito.' },
        { keywords: ['provincia'], response: '→ Certo.' },
        { keywords: ['cv', 'ricevo'], response: '→ Ricevi candidature con video e CV.' },
        { keywords: ['contattare'], response: '→ Sì.' },
        { keywords: ['disponibili'], response: '→ Certo.' },
        { keywords: ['modifico'], response: '→ Dal pannello del tuo annuncio.' },
        { keywords: ['evidenza'], response: '→ Non ancora, ma gli annunci sono già mirati.' },
        { keywords: ['tempo online'], response: '→ Finché vuoi.' },
        { keywords: ['filtrare', 'esperienza'], response: '→ Sì, anche se non è sempre il criterio migliore.' },
        { keywords: ['stagionali'], response: '→ Certo.' },
        { keywords: ['matching'], response: '→ Il sistema seleziona candidati compatibili.' },
        { keywords: ['statistiche'], response: '→ Sì.' },
        { keywords: ['elimino'], response: '→ Basta metterla offline o cancellarla.' },
        { keywords: ['più offerte'], response: '→ Meglio una per volta e ben divise.' },
        { keywords: ['piccole aziende'], response: '→ Sì, perfetto anche per PMI.' },
        { keywords: ['colloqui', 'chatbot'], response: '→ Non ancora, ma ci stiamo lavorando.' },
        { keywords: ['candidature'], response: '→ Dalla dashboard trovi tutto.' },
        { keywords: ['supporto'], response: '→ Sì.' },
        { keywords: ['integrare'], response: '→ Non ancora.' },
        { keywords: ['video candidati'], response: '→ Certo.' },
        { keywords: ['contattarmi'], response: '→ Sì.' },
        { keywords: ['chiudere'], response: '→ Certo.' },
        { keywords: ['notifiche'], response: '→ Sì.' },
        { keywords: ['limiti'], response: '→ No.' },
        { keywords: ['junior'], response: '→ Certo.' },
        { keywords: ['remote'], response: '→ Sì.' },
        { keywords: ['mobile'], response: '→ Certo.' },
        { keywords: ['social'], response: '→ Sì.' },
        { keywords: ['registro'], response: '→ Su JobTV Aziende' }
      ];

      // Cerca risposta appropriata
      let foundResponse = null;

      if (conversationState === 'candidate') {
        foundResponse = candidateResponses.find(response =>
          response.keywords.some(keyword => lowerMessage.includes(keyword))
        );
      } else if (conversationState === 'company') {
        foundResponse = companyResponses.find(response =>
          response.keywords.some(keyword => lowerMessage.includes(keyword))
        );
      }

      if (foundResponse) {
        addBotMessage(foundResponse.response);
      } else if (lowerMessage.includes("candidato") || lowerMessage.includes("lavoro")) {
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
          "Non sono sicuro di aver capito bene. 🤔\n\nPosso aiutarti con:\n• Informazioni su offerte di lavoro\n• Guida per la registrazione\n• Come candidarti\n• Come pubblicare annunci (se sei un'azienda)\n\nDimmi pure come posso aiutarti!"
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
