import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, User, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Role = 'candidate' | 'company' | null;

interface Option {
  text: string;
  value: string;
  action?: 'register' | 'backToMain' | 'navigate';
  path?: string;
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

// Define conversation steps outside to prevent re-creation on every render
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
  { botMessage: "Fantastico! 🎯 Iniziamo subito a trovare il posto giusto per te. Che tipo di lavoro stai cercando?", options: [
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
    { botMessage: "Che tipo di disponibilità oraria avresti?", options: [
      { text: "Full-time", value: "Full-time" },
      { text: "Part-time", value: "Part-time" },
      { text: "Turni", value: "Turni" },
      { text: "Cicli stagionali", value: "Stagionale" }
    ], key: "availability_type" },
  { botMessage: "Qual è il tuo titolo di studio più recente?", options: [
    { text: "Diploma", value: "Diploma" },
    { text: "Laurea", value: "Laurea" },
    { text: "Master / PhD", value: "Master" },
    { text: "Altro", value: "Altro" }
  ], key: "education_level" },
  { botMessage: "Che modalità di lavoro preferiresti?", options: [
    { text: "In presenza", value: "In presenza" },
    { text: "Ibrido (Smart Working)", value: "Ibrido" },
    { text: "Full Remote", value: "Remote" },
    { text: "Indifferente", value: "Indifferente" }
  ], key: "work_preference" },
  { botMessage: "Qual è il tuo preavviso attuale?", options: [
    { text: "Immediato (Disponibile subito)", value: "Immediato" },
    { text: "15 giorni", value: "15gg" },
    { text: "30 giorni", value: "30gg" },
    { text: "60+ giorni", value: "60gg" }
  ], key: "notice_period" },
  { botMessage: "Ultima cosa importante: qual è la tua motivazione principale per cambiare lavoro?", options: [
    { text: "Crescita professionale", value: "Crescita" },
    { text: "Miglioramento economico", value: "Stipendio" },
    { text: "Ambiente di lavoro migliore", value: "Ambiente" },
    { text: "Nuove sfide tecnologiche", value: "Sfide" }
  ], key: "motivation" },
  { botMessage: "Fantastico! 🎯\n\nSono qui per guidarti nel tuo percorso di ricerca del lavoro.\n\nSu JobTV puoi:\n\n✅ Creare un profilo professionale completo\n✅ Registrare brevi video di presentazione (è fondamentale! Le aziende così ti conoscono meglio)\n✅ Rispondere a semplici domande mentre sei vestito da colloquio - rilassati, non devi preoccuparti\n✅ Ricevere proposte dalle aziende in target per te\n✅ Iniziare a comunicare direttamente con loro\n\nSei pronto a iniziare? I tuoi video sono la chiave per farti scoprire dalle aziende giuste!", options: [
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
  { botMessage: "Qual è la dimensione della vostra azienda?", options: [
    { text: "Micro (1-10 dipendenti)", value: "Micro" },
    { text: "Piccola (11-50 dipendenti)", value: "Piccola" },
    { text: "Media (51-250 dipendenti)", value: "Media" },
    { text: "Grande (oltre 250)", value: "Grande" }
  ], key: "company_size" },
  { botMessage: "Che tipo di realtà rappresenti?", options: [
    { text: "Startup", value: "Startup" },
    { text: "PMI (Piccola/Media Impresa)", value: "PMI" },
    { text: "Grande Azienda / Gruppo", value: "Enterprise" },
    { text: "Agenzia di Recruiting", value: "Agency" }
  ], key: "company_type" },
  { botMessage: "Qual è il budget RAL (Reddito Annuo Lordo) previsto per questa posizione?", options: [
    { text: "Sotto i 25k", value: "<25k" },
    { text: "25k - 35k", value: "25-35k" },
    { text: "35k - 50k", value: "35-50k" },
    { text: "Oltre 50k", value: ">50k" }
  ], key: "salary_budget" },
  { botMessage: "Entro quanto tempo vorreste inserire la risorsa?", options: [
    { text: "Subito (Urgente)", value: "Urgente" },
    { text: "Entro 1 mese", value: "1 mese" },
    { text: "Entro 3 mesi", value: "3 mesi" },
    { text: "Solo scouting preventivo", value: "Scouting" }
  ], key: "hiring_timeline" },
  { botMessage: "Quali sono i principali benefit che offrite ai dipendenti?", options: [
    { text: "Buoni pasto / Mensa", value: "Buoni pasto" },
    { text: "Assicurazione sanitaria / Welfare", value: "Welfare" },
    { text: "Formazione pagata", value: "Formazione" },
    { text: "Auto aziendale / Mezzi", value: "Auto" },
    { text: "Nessun benefit particolare", value: "Nessuno" }
  ], key: "benefits_offered" },
  { botMessage: "Eccellente! 🚀\n\nBenvenuto nel futuro del recruiting!\n\nSu JobTV le aziende come la tua possono:\n\n✅ Cercare nel database di candidati pre-qualificati\n✅ Creare e pubblicare le tue offerte di lavoro\n✅ Registrare un VIDEO della tua ricerca di personale (questo è fondamentale! Solo così capiamo cosa cerchi veramente e possiamo filtrare i candidati perfetti per te)\n✅ Ricevere like dai candidati in target che corrispondono al tuo profilo\n✅ Contattare direttamente i candidati che ti interessano\n\n💰 NON paghi nulla fino a quando non scegli un candidato e decidi di pagargli il primo mese di lavoro.\n\nInitiamo subito? Il tuo video è essenziale per trovare i migliori talenti!", options: [
    { text: "💼 INIZIA ORA - Crea la Tua Offerta", value: "register_company", action: "register" }
  ], key: "final_company_message" }
];

const candidateLoggedInFlowSteps: StepDefinition[] = [
  { 
    botMessage: "Bentornato! 👋 Sei pronto a farti notare dalle migliori aziende?\n\nEcco cosa ti suggerisco per avere successo:\n✅ Registra i tuoi video di presentazione (è fondamentale!)\n✅ Carica il tuo CV aggiornato in formato PDF\n✅ Monitora costantemente i match nella tua dashboard\n\nCosa vuoi fare oggi?", 
    options: [
      { text: "🎥 Registra Video", value: "record", action: "navigate", path: "/record-interview" },
      { text: "📄 Carica CV", value: "cv", action: "navigate", path: "/candidate/profile" },
      { text: "📊 Dashboard", value: "dashboard", action: "navigate", path: "/dashboard" }
    ], 
    key: "candidate_logged_in" 
  }
];

const companyLoggedInFlowSteps: StepDefinition[] = [
  { 
    botMessage: "Bentornato! 🚀 Vuoi trovare il talento perfetto ancora più velocemente?\n\nEcco i segreti per un recruiting efficace su JobTV:\n✅ Registra un VIDEO della tua ricerca (fa la differenza!)\n✅ Metti più dettagli possibili nell'annuncio\n✅ Monitora i candidati che ti hanno messo Like\n\nIn cosa posso aiutarti oggi?", 
    options: [
      { text: "🎥 Registra Video", value: "record", action: "navigate", path: "/record-interview" },
      { text: "💼 Crea Offerta", value: "create", action: "navigate", path: "/create-job-offer" },
      { text: "📊 Dashboard", value: "dashboard", action: "navigate", path: "/company/dashboard" }
    ], 
    key: "company_logged_in" 
  }
];

const candidateHasVideoFlowSteps: StepDefinition[] = [
  { 
    botMessage: "Bentornato! 👋 Ottimo lavoro con i tuoi video di presentazione! 🎥 Sono il modo migliore per farti notare dalle aziende.\n\nAssicurati che il tuo CV sia aggiornato e monitora costantemente i match nella tua dashboard per non perdere occasioni. Cosa vuoi fare oggi?", 
    options: [
      { text: "📊 Dashboard", value: "dashboard", action: "navigate", path: "/dashboard" },
      { text: "📄 Gestisci CV", value: "cv", action: "navigate", path: "/candidate/profile" },
      { text: "🎥 I miei Video", value: "videos", action: "navigate", path: "/video-interview" }
    ], 
    key: "candidate_has_video" 
  }
];

const companyHasVideoFlowSteps: StepDefinition[] = [
  { 
    botMessage: "Bentornato! 🚀 Hai già registrato un video per la tua ricerca, eccellente! Questo aumenta del 95% l'efficacia del tuo annuncio.\n\nRicorda di inserire tutti i dettagli possibili nell'offerta e di controllare chi ti ha messo Like. Come posso aiutarti oggi?", 
    options: [
      { text: "📊 Dashboard", value: "dashboard", action: "navigate", path: "/company/dashboard" },
      { text: "💼 Crea Offerta", value: "create", action: "navigate", path: "/create-job-offer" },
      { text: "🎥 Gestisci Video", value: "videos", action: "navigate", path: "/record-interview" }
    ], 
    key: "company_has_video" 
  }
];

const informativeFlowStep: StepDefinition = { botMessage: "JobTV rivoluziona il recruiting!", key: "informative_message" };

const GuidedChatBot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState<Role>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchUserType = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .maybeSingle();
        if (data) setUserType(data.user_type as Role);

        // Controlla se l'utente ha già caricato dei video (adattato per entrambi i ruoli)
        const columnCheck = data?.user_type === 'candidate' ? 'candidate_id' : 'company_id';
        const { count } = await supabase
          .from('video_interviews')
          .select('*', { count: 'exact', head: true })
          .eq(columnCheck, user.id);
        
        setHasVideo(!!count && count > 0);
      };
      fetchUserType();
    } else {
      setUserType(null);
    }
  }, [user]);

  // Renamed `isVisible` to `showCompanyOfferPopup` to reflect its current purpose
  const [showCompanyOfferPopup, setShowCompanyOfferPopup] = useState(() => {
    // Initialize from local storage, default to true if not found
    return localStorage.getItem('jobtv_showCompanyOfferPopup') !== 'false';
  });
  // New state for the "SEI CANDIDATO?" popup
  const [showCandidateOfferPopup, setShowCandidateOfferPopup] = useState(() => {
    return localStorage.getItem('jobtv_showCandidateOfferPopup') !== 'false';
  });
  // Nuovo stato per il popup "Non hai trovato candidati?"
  const [showNoCandidatesPopup, setShowNoCandidatesPopup] = useState(() => {
    return localStorage.getItem('jobtv_showNoCandidatesPopup') !== 'false';
  });
  const [step, setStep] = useState(0); // 0: initial role selection, 1+: flow specific steps
  const [role, setRole] = useState<Role>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userData, setUserData] = useState<Record<string, string>>({});
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Persist popup visibility states to local storage
  useEffect(() => {
    localStorage.setItem('jobtv_showCompanyOfferPopup', String(showCompanyOfferPopup));
  }, [showCompanyOfferPopup]);

  useEffect(() => {
    localStorage.setItem('jobtv_showCandidateOfferPopup', String(showCandidateOfferPopup));
  }, [showCandidateOfferPopup]);

  useEffect(() => {
    localStorage.setItem('jobtv_showNoCandidatesPopup', String(showNoCandidatesPopup));
  }, [showNoCandidatesPopup]);
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
    if (isOpen && messages.length === 0 && user && userType) {
      let flow = userType === 'candidate' ? candidateLoggedInFlowSteps : companyLoggedInFlowSteps;
      
      if (hasVideo) {
        flow = userType === 'candidate' ? candidateHasVideoFlowSteps : companyHasVideoFlowSteps;
      }

      sendBotMessage({
        id: Date.now(),
        text: flow[0].botMessage,
        isBot: true,
        options: flow[0].options,
        key: flow[0].key
      });
    } else if (isOpen && messages.length === 0) {
      setMessages([initialBotMessage]);
    }
  }, [isOpen, user, userType, hasVideo]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle chat open event from custom event
  useEffect(() => {
    const handleOpenChatEvent = (event: CustomEvent<{ role?: Role }>) => {
      setIsOpen(true);
      if (event.detail?.role) {
        // If a role is provided, bypass initial selection and start flow directly
        setRole(event.detail.role);
        setStep(1); // Start from the first step of the specific flow
        const flowSteps = event.detail.role === 'candidate' ? candidateFlowSteps : companyFlowSteps;
        if (flowSteps.length > 0) {
          sendBotMessage({
            id: Date.now(),
            text: flowSteps[0].botMessage,
            isBot: true,
            options: flowSteps[0].options,
            isInput: flowSteps[0].isInput,
            key: flowSteps[0].key
          });
        }
      } else if (messages.length === 0) {
        if (user && userType) return;
        setMessages([initialBotMessage]);
      }
    };
    window.addEventListener('open-jobtv-chat', handleOpenChatEvent as EventListener);
    return () => window.removeEventListener('open-jobtv-chat', handleOpenChatEvent as EventListener);
  }, [initialBotMessage, candidateFlowSteps, companyFlowSteps]); // Add dependencies

  const resetChat = () => {
    setIsOpen(false);
    setStep(0);
    setRole(null);
    setMessages([]);
    setInputValue('');
    setUserData({});
    // Do not reset popup visibility here, as they are user-controlled via 'X'
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

  const handleOptionClick = (optionValue: string, optionText: string, action?: 'register' | 'backToMain' | 'navigate', path?: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text: optionText, isBot: false }]);
    
    // Store the option value using the key from the last bot message that presented options
    const lastBotMessageWithOptions = messages.slice().reverse().find(msg => msg.isBot && msg.options);
    if (lastBotMessageWithOptions && lastBotMessageWithOptions.key) {
        setUserData(prev => ({ ...prev, [lastBotMessageWithOptions.key]: optionValue }));
    }

    if (action === 'navigate' && path) {
      navigate(path);
      setIsOpen(false);
      return;
    } else if (action === 'register') {
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

  // Render the component only if the chat is open OR if at least one popup is visible
  const shouldRenderPopups = showCompanyOfferPopup || showCandidateOfferPopup;
  if (!shouldRenderPopups && !isOpen) return null;

  return (
    <div className="fixed bottom-6 right-4 md:bottom-10 md:right-10 z-50">
      {!isOpen ? (
        <div className="flex flex-col items-end space-y-4"> {/* Container for multiple popups */}
          {showCandidateOfferPopup && (
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-500">
              <div
                className="bg-white border-2 border-jobtv-blue p-5 rounded-lg shadow-2xl max-w-[260px] cursor-pointer hover:border-jobtv-teal transition-all group relative"
                onClick={() => setIsOpen(true)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCandidateOfferPopup(false);
                  }}
                  className="absolute -top-3 -right-3 bg-white border-2 border-gray-100 rounded-full p-1.5 shadow-md hover:bg-red-50 hover:text-red-500 transition-all z-10"
                  title="Chiudi popup"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-jobtv-blue tracking-wider uppercase">Sei un Candidato?</p>
                  <p className="text-sm font-semibold leading-snug text-gray-800">
                    CLICCA QUI <span className="text-jobtv-teal font-extrabold underline underline-offset-2">PER TROVARE LAVORO</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {showCompanyOfferPopup && (
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-500">
              <div
                className="bg-white border-2 border-jobtv-blue p-5 rounded-lg shadow-2xl max-w-[260px] cursor-pointer hover:border-jobtv-teal transition-all group relative"
                onClick={() => setIsOpen(true)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCompanyOfferPopup(false);
                  }}
                  className="absolute -top-3 -right-3 bg-white border-2 border-gray-100 rounded-full p-1.5 shadow-md hover:bg-red-50 hover:text-red-500 transition-all z-10"
                  title="Chiudi popup"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-jobtv-blue tracking-wider uppercase">Sei un'Azienda?</p>
                  <p className="text-sm font-semibold leading-snug text-gray-800">
                    CREA LA TUA OFFERTA DI LAVORO <span className="text-jobtv-teal font-extrabold underline underline-offset-2">CLICCANDO QUI</span>
                  </p>
                </div>
              </div>
            </div>
          )}
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
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
                    onClick={() => handleOptionClick(option.value, option.text, option.action, option.path)}
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
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lastBotMessage?.key && handleUserResponse(inputValue, lastBotMessage.key)}
                placeholder="Scrivi qui la tua risposta..."
                className="flex-1 rounded-full bg-gray-50 border-gray-200"
              />
              <Button size="icon" onClick={() => lastBotMessage?.key && handleUserResponse(inputValue, lastBotMessage.key)} className="bg-jobtv-blue rounded-full h-10 w-10 shrink-0">
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