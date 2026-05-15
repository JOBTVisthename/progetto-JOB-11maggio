import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, User, Building2 } from 'lucide-react';

type Role = 'candidate' | 'company' | null;

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const GuidedChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Ciao! Benvenuto su JobTV. Come posso aiutarti oggi?", isBot: true },
    { id: 1, text: "Benvenuto nel Centro Assistenza JobTV! Sono qui per guidarti nella configurazione del tuo profilo.", isBot: true },
    { id: 2, text: "Sei un candidato in cerca di lavoro o un'azienda che cerca talenti?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [userData, setUserData] = useState<Record<string, string>>({});
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-jobtv-chat', handleOpenChat);
    return () => window.removeEventListener('open-jobtv-chat', handleOpenChat);
  }, []);

  const candidateSteps = [
    "Che tipo di ruolo professionale stai cercando?",
    "In quale città o regione preferireiali lavorare?",
    "Quanti anni di esperienza hai in questo settore?",
    "Perfetto! Ho raccolto queste informazioni. Ora registrati per completare il tuo profilo video e iniziare il matching!"
  ];

  const companySteps = [
    "Qual è il nome della tua azienda?",
    "In quale settore operate principalmente?",
    "Quante posizioni aperte avete attualmente?",
    "Ottimo! Per visualizzare i profili e le video interviste dei candidati, procedi con la registrazione aziendale."
  ];

  const handleRoleSelection = (selectedRole: Role) => {
    setRole(selectedRole);
    const firstQuestion = selectedRole === 'candidate' ? candidateSteps[0] : companySteps[0];
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: selectedRole === 'candidate' ? "Sono un candidato" : "Sono un'azienda", isBot: false },
      { id: Date.now() + 1, text: firstQuestion, isBot: true }
    ]);
    setStep(1);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !role) return;

    const currentSteps = role === 'candidate' ? candidateSteps : companySteps;
    
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: inputValue, isBot: false }
    ]);

    setUserData(prev => ({ ...prev, [`info_step_${step}`]: inputValue }));
    setInputValue('');

    setTimeout(() => {
      if (step < currentSteps.length - 1) {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, text: currentSteps[step], isBot: true }
        ]);
        setStep(prev => prev + 1);
      } else {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, text: currentSteps[currentSteps.length - 1], isBot: true }
        ]);
        setStep(currentSteps.length);
      }
    }, 600);
  };

  const goToRegister = () => {
    const params = new URLSearchParams({
      role: role || '',
      from_chat: 'true',
      ...userData
    });
    navigate(`/register?${params.toString()}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full shadow-2xl bg-jobtv-gradient hover:scale-110 transition-all duration-300"
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </Button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-[320px] md:w-[380px] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-jobtv-gradient p-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-semibold">Chat Assistenza JobTV</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 p-4 h-[400px] overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.isBot ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm' : 'bg-jobtv-blue text-white rounded-tr-none shadow-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {step === 0 && (
              <div className="grid grid-cols-1 gap-2 mt-4">
                <Button variant="outline" onClick={() => handleRoleSelection('candidate')} className="justify-start text-xs border-jobtv-blue/20 hover:bg-jobtv-blue/5">
                  <User className="w-4 h-4 mr-2 text-jobtv-blue" /> Sono un Candidato
                </Button>
                <Button variant="outline" onClick={() => handleRoleSelection('company')} className="justify-start text-xs border-jobtv-teal/20 hover:bg-jobtv-teal/5">
                  <Building2 className="w-4 h-4 mr-2 text-jobtv-teal" /> Sono un'Azienda
                </Button>
              </div>
            )}

            {role && step >= (role === 'candidate' ? candidateSteps.length : companySteps.length) && (
              <Button onClick={goToRegister} className="w-full bg-jobtv-gradient mt-4 animate-bounce">
                Registrati Ora
              </Button>
            )}
          </div>

          {role && step < (role === 'candidate' ? candidateSteps.length : companySteps.length) && (
            <div className="p-4 border-t bg-white flex space-x-2">
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Scrivi qui la tua risposta..."
                className="flex-1 rounded-full bg-gray-50 border-gray-200"
              />
              <Button size="icon" onClick={handleSendMessage} className="bg-jobtv-blue rounded-full h-10 w-10 shrink-0">
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