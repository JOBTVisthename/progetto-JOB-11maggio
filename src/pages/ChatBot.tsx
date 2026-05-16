import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, MessageCircle, Rocket, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useChatFlow } from './hooks/useChatFlow';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, step, data, processStep, startFlowWithRole } = useChatFlow();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleExternalOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.role) {
        startFlowWithRole(e.detail.role);
      }
    };
    window.addEventListener('open-jobtv-chat', handleExternalOpen);
    return () => window.removeEventListener('open-jobtv-chat', handleExternalOpen);
  }, [startFlowWithRole]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processStep(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-2xl bg-jobtv-gradient hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <Card className="w-[350px] sm:w-[400px] h-[550px] flex flex-col shadow-2xl border-jobtv-blue/10 animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="p-4 bg-jobtv-gradient text-white flex flex-row items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-semibold">Recruiter Digitale JobTV</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.isBot 
                    ? 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none' 
                    : 'bg-jobtv-blue text-white rounded-tr-none'
                }`}>
                  {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            ))}

            {/* Call to Actions Finali */}
            {step === 'CAND_FINAL' && (
              <Button 
                className="w-full bg-jobtv-gradient text-white font-bold py-6 mt-4 shadow-lg"
                onClick={() => navigate('/record-interview')}
              >
                <Video className="mr-2 h-5 w-5" /> INIZIA ORA - Registra Video
              </Button>
            )}
            {step === 'COMP_FINAL' && (
              <Button 
                className="w-full bg-jobtv-gradient text-white font-bold py-6 mt-4 shadow-lg"
                onClick={() => navigate('/create-job-offer')}
              >
                <Rocket className="mr-2 h-5 w-5" /> INIZIA ORA - Crea Offerta
              </Button>
            )}
          </CardContent>

          {step !== 'CAND_FINAL' && step !== 'COMP_FINAL' && (
            <form onSubmit={handleSubmit} className="p-4 border-t bg-white flex gap-2">
              <Input 
                placeholder="Scrivi qui..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-full border-gray-200 focus:border-jobtv-teal"
              />
              <Button type="submit" size="icon" className="rounded-full bg-jobtv-blue shrink-0">
                <Send className="h-4 w-4 text-white" />
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
};

export default ChatBot;