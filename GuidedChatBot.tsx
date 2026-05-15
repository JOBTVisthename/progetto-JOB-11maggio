import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, User, Building2 } from 'lucide-react';

type Role = 'candidate' | 'company' | null;

interface Option {
  text: string;
  value: string;
  action?: 'register' | 'backToMain';
}

interface StepDefinition {
  botMessage: string;
  options?: Option[];
  isInput?: boolean;
  key: string; // Key to store the user's response in userData
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  options?: Option[];
  isInput?: boolean;
  key?: string; // To link message to a step for input handling
}

const GuidedChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [step, setStep] = useState(0); // 0: initial role selection, 1+: flow specific steps
  const [role, setRole] = useState<Role>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userData, setUserData] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Define conversation steps
  const initialBotMessage: Message = {
    id: 1,
    text: "Ciao! 👋 Sono JOBBOLO, il tuo assistente di lavoro! Sei un candidato o un'azienda?",
    isBot: true,
    options: [
      { text: "Cerco lavoro", value: "candidate" },
      { text: "Sono un'azienda", value: "company" }
    ],
    key: "role_selection"
  };

  const candidateFlowSteps: StepDefinition[] = [
    { botMessage: "Perfetto! Che tipo di lavoro stai cercando?", options: [
      { text: "Operaio/Produzione", value: "Operaio/Produzione" },
      { text: "Ufficio/Amministrazione", value: "Ufficio/Amministrazione" },
      { text: "Commerciale/Vendite", value: "Commerciale/Vendite" },
      { text: "Informatica/Tech", value: "Informatica/Tech" },
      { text: "Altro...", value: "Altro" }
    ], key: "job_type" },
    { botMessage: "In quale città o zona vorresti lavorare?", isInput: true, key: "location" },
    { botMessage: "Che tipo di contratto preferisci?", options: [
      { text: "Tempo indeterminato", value: "Tempo indeterminato" },
      { text: "Tempo determinato", value: "Tempo determinato" },
      { text: "Part-time", value: "Part-time" },
      { text: "Stage/Tirocinio", value: "Stage/Tirocinio" },
      { text: "Non ho preferenze", value: "Non ho preferenze" }
    ], key: "contract_type" },
    { botMessage: "Sei disposto a spostarti dalla tua città?", options: [
      { text: "Sì, anche in tutta Italia", value: "Sì, anche in tutta Italia" },
      { text: "Solo provincia", value: "Solo provincia" },
      { text: "Max 30 km", value: "Max 30 km" },
      { text: "No, solo nella mia città", value: "No, solo nella mia città" }
    ], key: "relocation_willingness" },
    { botMessage: "Hai già esperienza in questo settore?", options: [
      { text: "Sì, ho esperienza", value: "Sì, ho esperienza" },
      { text: "Sono alla prima esperienza", value: "Sono alla prima esperienza" },
      { text: "Ho fatto uno stage", value: "Ho fatto uno stage" }
    ], key: "experience_level" },
    { botMessage: "Ottimo! 🎯 Ho già trovato aziende che potrebbero fare al caso tuo nella tua zona! Registrati gratis in 2 minuti, carica il tuo video di presentazione e ricevi subito i tuoi match. Le aziende ti contatteranno direttamente!", options: [
      { text: "Registrati gratis →", value: "register_candidate", action: "register" }
    ], key: "final_candidate_message" }
  ];

  const companyFlowSteps: StepDefinition[] = [
    { botMessage: "Benvenuto! Vuoi subito pubblicare un'offerta di lavoro o preferisci sapere prima come funziona?", options: [
      { text: "Voglio pubblicare subito", value: "publish_now" },
      { text: "Dimmi come funziona", value: "how_it_works" }
    ], key: "company_initial_choice" },
    { botMessage: "Che figura professionale stai cercando?", options: [
      { text: "Operaio/Produzione", value: "Operaio/Produzione" },
      { text: "Impiegato/Amministrazione", value: "Impiegato/Amministrazione" },
      { text: "Commerciale", value: "Commerciale" },
      { text: "Tecnico/IT", value: "Tecnico/IT" },
      { text: "Altro...", value: "Altro" }
    ], key: "job_role_company" },
    { botMessage: "In quale zona cerchi il candidato?", isInput: true, key: "candidate_location_company" },
    { botMessage: "Che tipo di contratto offri?", options: [
      { text: "Tempo indeterminato", value: "Tempo indeterminato" },
      { text: "Tempo determinato", value: "Tempo determinato" },
      { text: "Part-time", value: "Part-time" },
      { text: "Stage", value: "Stage" },
      { text: "Altro", value: "Altro" }
    ], key: "contract_type_company" },
    { botMessage: "Quanta esperienza deve avere il candidato?", options: [
      { text: "Prima esperienza va bene", value: "Prima esperienza va bene" },
      { text: "Minimo 1-2 anni", value: "Minimo 1-2 anni" },
      { text: "Minimo 3-5 anni", value: "Minimo 3-5 anni" },
      { text: "Senior 5+ anni", value: "Senior 5+ anni" }
    ], key: "experience_level_company" },
    { botMessage: "Perfetto! 🚀 Abbiamo già candidati nella tua zona che cercano esattamente questo ruolo! Per scoprire i profili, vedere i loro video di presentazione e contattarli direttamente, registra la tua azienda e pubblica l'offerta. È gratis per iniziare!", options: [
      { text: "Registra la tua azienda →", value: "register_company", action: "register" }
    ], key: "final_company_message" }
  ];

  const informativeFlowStep: StepDefinition = {
    botMessage: "JobTV è la piattaforma che rivoluziona il recruiting! 🎬 ✅ I candidati caricano un video di presentazione ✅ L'AI fa il matching con le tue offerte ✅ Tu vedi solo i candidati più adatti ✅ Risparmi ore di colloqui inutili Vuoi provare? È gratis!",
    options: [
      { text: "Sì, mi registro →", value: "register_company", action: "register" },
      { text: "Ho altre domande", value: "back_to_company_main", action: "backToMain" }
    ],
    key: "informative_message"
  };

  // Carica i dati salvati all'avvio
  useEffect(() => {
    const saved = localStorage.getItem('jobtv_chat_draft');
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  // Auto-salvataggio ogni volta che userData cambia
  useEffect(() => {
    if (Object.keys(userData).length > 0) {
      localStorage.setItem('jobtv_chat_draft', JSON.stringify(userData));
    }
  }, [userData]);

  // Initialize messages when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialBotMessage]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle chat open event from custom event
  useEffect(() => {
    const handleOpenChatEvent = () => {
      setIsOpen(true);
      // Messages will be initialized by the other useEffect when isOpen becomes true
    };
    window.addEventListener('open-jobtv-chat', handleOpenChatEvent);
    return () => window.removeEventListener('open-jobtv-chat', handleOpenChatEvent);
  }, []); // Only run once on mount

  const resetChat = () => {
    setIsOpen(false);
    setStep(0);
    setRole(null);
    setMessages([]);
    setInputValue('');
    setUserData({});
  };

  const sendBotMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleUserResponse = (userText: string, currentStepKey?: string) => {
    if (!userText.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: inputValue, isBot: false }
    ]);
    if (currentStepKey) {
      setUserData(prev => ({ ...prev, [currentStepKey]: userText }));
    }
    setInputValue('');

    setTimeout(() => {
      processNextStep(userText);
    }, 600);
  };

  const handleOptionClick = (optionValue: string, optionText: string, action?: 'register' | 'backToMain') => {
    setMessages(prev => [...prev, { id: Date.now(), text: optionText, isBot: false }]);
    
    // Store the option value using the key from the last bot message that presented options
    const lastBotMessageWithOptions = messages.slice().reverse().find(msg => msg.isBot && msg.options);
    if (lastBotMessageWithOptions && lastBotMessageWithOptions.key) {
        setUserData(prev => ({ ...prev, [lastBotMessageWithOptions.key]: optionValue }));
    }

    if (action === 'register') {
      const params = new URLSearchParams({
        role: role || '',
        from_chat: 'true',
        ...userData
      });
      navigate(`/register/${role === 'candidate' ? 'candidate' : 'company'}?${params.toString()}`);
      setIsOpen(false); // Close chat after navigation
      resetChat(); // Reset chat for next time
      return;
    } else if (action === 'backToMain') {
      // This is specifically for "Ho altre domande" from informative flow
      setRole('company'); // Ensure role is company for this flow
      setStep(1); // Set step to 1, which is the index for companyFlowSteps[0]
      sendBotMessage({
        id: Date.now(),
        text: companyFlowSteps[0].botMessage,
        isBot: true,
        options: companyFlowSteps[0].options,
        isInput: companyFlowSteps[0].isInput,
        key: companyFlowSteps[0].key
      });
      return;
    }

    setTimeout(() => {
      processNextStep(optionValue); // Pass the option value to determine next step
    }, 600);
  };

  const processNextStep = (lastUserResponseValue: string) => {
    let nextStepDefinition: StepDefinition | null = null;
    let newRole: Role = role;
    let newStep = step; // This is the current step index

    if (role === null) { // Initial role selection (step 0)
      if (lastUserResponseValue === "candidate") {
        newRole = 'candidate';
        newStep = 1; // Move to first step of candidate flow (index 0 in array)
        nextStepDefinition = candidateFlowSteps[0];
      } else if (lastUserResponseValue === "company") {
        newRole = 'company';
        newStep = 1; // Move to first step of company flow (index 0 in array)
        nextStepDefinition = companyFlowSteps[0];
      }
    } else if (role === 'candidate') {
      newStep = step + 1; // Increment step for candidate flow
      if (newStep <= candidateFlowSteps.length) {
        nextStepDefinition = candidateFlowSteps[newStep - 1];
      }
    } else if (role === 'company') {
      // Special handling for company initial choice (step 1, which corresponds to companyFlowSteps[0])
      if (step === 1) { // This means we are at the first company question
        if (lastUserResponseValue === "how_it_works") {
          nextStepDefinition = informativeFlowStep;
          // newStep remains 1, as informative flow is a detour from companyFlowSteps[0]
        } else if (lastUserResponseValue === "publish_now") {
          newStep = step + 1; // Move to companyFlowSteps[1]
          nextStepDefinition = companyFlowSteps[newStep - 1];
        }
      } else { // Regular company flow progression
        newStep = step + 1;
        if (newStep <= companyFlowSteps.length) {
          nextStepDefinition = companyFlowSteps[newStep - 1];
        }
      }
    }

    if (nextStepDefinition) {
      sendBotMessage({
        id: Date.now(),
        text: nextStepDefinition.botMessage,
        isBot: true,
        options: nextStepDefinition.options,
        isInput: nextStepDefinition.isInput,
        key: nextStepDefinition.key
      });
      setRole(newRole);
      setStep(newStep);
    } else {
      // End of flow, or unexpected state.
      // The last message should have a register action.
      console.log("End of flow. User data:", userData);
    }
  };

  // Determine current bot message and options/input based on the last message in the array
  const lastBotMessage = messages.slice().reverse().find(msg => msg.isBot);
  const showInput = lastBotMessage?.isInput;
  const showOptions = lastBotMessage?.options && lastBotMessage.options.length > 0;

  /*
  const goToRegister = () => {
    const params = new URLSearchParams({
      role: role || '',
      from_chat: 'true',
      ...userData
    });
    navigate(`/register?${params.toString()}`);
  };*/

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      {!isOpen ? (
        <div className="relative group">
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl bg-jobtv-gradient hover:scale-110 transition-all duration-300"
          >
            <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </Button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-100 hover:text-red-500"
            title="Chiudi assistente"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-[280px] sm:w-[320px] md:w-[380px] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[85vh]">
          <div className="bg-jobtv-gradient p-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-semibold">Chat Assistenza JobTV</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
          </div>

          <div id="chat-messages" ref={chatWindowRef} className="flex-1 p-4 h-[400px] overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.isBot ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm' : 'bg-jobtv-blue text-white rounded-tr-none shadow-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Render options if available and it's the last bot message */}
            {lastBotMessage && lastBotMessage.options && lastBotMessage.isBot && (
              <div className="grid grid-cols-1 gap-2 mt-4">
                {lastBotMessage.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleOptionClick(option.value, option.text, option.action)}
                    className="justify-start text-xs border-jobtv-blue/20 hover:bg-jobtv-blue/5"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
          {/* Input field for text responses */}
          {lastBotMessage && lastBotMessage.isInput && lastBotMessage.isBot && (
            <div className="p-4 border-t bg-white flex space-x-2">
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)} // Changed from handleSendMessage to handleUserResponse
                onKeyDown={(e) => e.key === 'Enter' && handleUserResponse(inputValue, lastBotMessage.key)}
                placeholder="Scrivi qui la tua risposta..."
                className="flex-1 rounded-full bg-gray-50 border-gray-200"
              />
              <Button size="icon" onClick={() => handleUserResponse(inputValue, lastBotMessage.key)} className="bg-jobtv-blue rounded-full h-10 w-10 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GuidedChatBot;