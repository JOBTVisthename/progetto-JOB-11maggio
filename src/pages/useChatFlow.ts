import { useState, useCallback } from 'react';
import { ChatData, Message, ChatStep, Role } from '../types/chat';

export const useChatFlow = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Benvenuto su JobTV! 👋 Come posso aiutarti? Cerchi lavoro o vuoi assumere personale?", isBot: true, timestamp: new Date() }
  ]);
  const [data, setData] = useState<ChatData>({ role: null });
  const [step, setStep] = useState<ChatStep>('START');

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(), text, isBot: true, timestamp: new Date() }]);
  };

  const startFlowWithRole = useCallback((role: Role) => {
    setData(d => ({ ...d, role }));
    if (role === 'candidate') {
      setStep('CAND_JOB');
      setMessages([{ id: 'init-cand', text: "Ciao 👋 Che lavoro stai cercando?", isBot: true, timestamp: new Date() }]);
    } else {
      setStep('COMP_PERSONNEL');
      setMessages([{ id: 'init-comp', text: "Benvenuto su JobTV 🚀 Stai cercando personale?", isBot: true, timestamp: new Date() }]);
    }
  }, []);

  const processStep = useCallback((input: string) => {
    const text = input.trim();
    if (!text) return;

    // Aggiungi messaggio utente
    setMessages(prev => [...prev, { id: Math.random().toString(), text, isBot: false, timestamp: new Date() }]);

    // LOGICA DI TRANSIZIONE
    setTimeout(() => {
      // 1. Rilevamento Ruolo
      if (step === 'START') {
        const lower = text.toLowerCase();
        if (lower.includes('lavoro') || lower.includes('cerco') || lower.includes('candidato')) {
          setData(d => ({ ...d, role: 'candidate' }));
          setStep('CAND_JOB');
          addBotMessage("Ciao 👋 Che lavoro stai cercando?");
          return;
        }
        if (lower.includes('assum') || lower.includes('person') || lower.includes('azienda')) {
          setData(d => ({ ...d, role: 'company' }));
          setStep('COMP_PERSONNEL');
          addBotMessage("Benvenuto su JobTV 🚀 Stai cercando personale?");
          return;
        }
        addBotMessage("Non sono sicuro di aver capito. Cerchi lavoro o vuoi assumere?");
        return;
      }

      // 2. Flow Candidato
      if (data.role === 'candidate') {
        switch (step) {
          case 'CAND_JOB':
            setData(d => ({ ...d, jobTitle: text }));
            setStep('CAND_CITY');
            addBotMessage(`Capito, un ruolo come ${text}. In che zona vorresti lavorare?`);
            break;
          case 'CAND_CITY':
            setData(d => ({ ...d, city: text }));
            setStep('CAND_RELOC');
            addBotMessage("Sei disponibile a trasferirti o preferisci restare nella tua città?");
            break;
          case 'CAND_RELOC':
            setData(d => ({ ...d, availability: text }));
            setStep('CAND_EXP');
            addBotMessage("Hai già esperienza in questo settore?");
            break;
          case 'CAND_EXP':
            setData(d => ({ ...d, experience: text }));
            setStep('CAND_NAME');
            addBotMessage("Ottimo. Un'ultima cosa: come ti chiami?");
            break;
          case 'CAND_NAME':
            setData(d => ({ ...d, name: text }));
            setStep('CAND_VIDEO');
            addBotMessage(`Perfetto ${text}. Su JobTV i video aumentano molto le possibilità di essere contattato.`);
            setTimeout(() => {
              addBotMessage("Ti farò alcune semplici domande, come in un mini colloquio 👍");
              setStep('CAND_FINAL');
            }, 1000);
            break;
        }
      }

      // 3. Flow Azienda
      if (data.role === 'company') {
        switch (step) {
          case 'COMP_PERSONNEL':
            setStep('COMP_ROLE');
            addBotMessage("Ottimo. Che figura vuoi assumere?");
            break;
          case 'COMP_ROLE':
            setData(d => ({ ...d, jobTitle: text }));
            setStep('COMP_CITY');
            addBotMessage(`In quale città o zona cerchi un ${text}?`);
            break;
          case 'COMP_CITY':
            setData(d => ({ ...d, city: text }));
            setStep('COMP_CONTRACT');
            addBotMessage(`Perfetto, a ${text}. Che tipo di contratto offri?`);
            break;
          case 'COMP_CONTRACT':
            setData(d => ({ ...d, contractType: text }));
            setStep('COMP_COUNT');
            addBotMessage("Quante persone stai cercando?");
            break;
          case 'COMP_COUNT':
            setData(d => ({ ...d, hiringCount: text }));
            setStep('COMP_SUMMARY');
            addBotMessage("Perfetto. Ecco cosa può fare JobTV per te:");
            setTimeout(() => {
              addBotMessage(
                "• Accesso a video CV reali\n" +
                "• Matching automatico basato su IA\n" +
                "• Chat diretta con i candidati\n" +
                "• Risparmio del 60% sui tempi di screening\n" +
                "• Nessun costo fisso iniziale"
              );
              setStep('COMP_FINAL');
            }, 1000);
            break;
        }
      }
    }, 600);
  }, [step, data]);

  return { messages, step, data, processStep };
};