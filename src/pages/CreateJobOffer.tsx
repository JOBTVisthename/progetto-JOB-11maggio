import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  FileText, 
  Euro, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Video,
  Save,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getTemplateByTitle } from './job-templates';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const jobOfferSchema = z.object({
  title: z.string().min(3, "Il titolo è troppo breve"),
  description: z.string().min(20, "La descrizione deve essere più dettagliata"),
  skills: z.string().min(5, "Inserisci almeno un paio di competenze"),
  salary_range: z.string().min(1, "Inserisci lo stipendio previsto"),
  location: z.string().min(2, "Inserisci la città di lavoro"),
  contract_type: z.string().min(1, "Seleziona il tipo di contratto"),
});

type JobOfferFormValues = z.infer<typeof jobOfferSchema>;

const CreateJobOffer: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const totalSteps = 4;

  const form = useForm<JobOfferFormValues>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      title: '',
      description: '',
      skills: '',
      salary_range: '',
      location: '',
      contract_type: 'Full-time',
    }
  });

  const nextStep = async () => {
    const fieldsToValidate = step === 1 ? ['title'] : step === 2 ? ['description', 'skills'] : ['salary_range', 'location', 'contract_type'];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      if (step === 1) setShowEncouragement(true);
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const jobTitle = form.watch('title');
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (values: JobOfferFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('job_offers').insert({
        company_id: user.id,
        ...values,
        skills: values.skills.split(',').map(s => s.trim()),
        status: 'active'
      });

      if (error) throw error;

      setShowFinalPopup(true);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile pubblicare l'offerta",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      <main className="container max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crea Offerta di Lavoro</h1>
              <p className="text-gray-500">Step {step} di {totalSteps}</p>
            </div>
            <Badge variant="outline" className="bg-white"><Save className="w-3 h-3 mr-1" /> Auto-salvataggio attivo</Badge>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        <Card className="shadow-xl border-gray-100 overflow-hidden bg-white">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: TITOLO */}
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-jobtv-blue mb-2">
                      <Briefcase className="w-5 h-5" />
                      <h2 className="text-xl font-bold">Qual è la posizione aperta?</h2>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Oggetto del lavoro / Titolo posizione</Label>
                      <Input 
                        id="title"
                        placeholder="es. Sviluppatore Frontend, Magazziniere..."
                        {...form.register('title')}
                        className="text-lg py-6 border-jobtv-blue/20 focus:border-jobtv-blue"
                      />
                      {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
                      <p className="text-xs text-gray-400 italic">Suggerimento: Inserendo il titolo, cercheremo di aiutarti con la descrizione!</p>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: DESCRIZIONE & SKILLS */}
                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-jobtv-teal mb-2">
                      <FileText className="w-5 h-5" />
                      <h2 className="text-xl font-bold">Descrizione e Competenze</h2>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Mansioni e Responsabilità</Label>
                      <Textarea 
                        id="description"
                        rows={6}
                        {...form.register('description')}
                        className="border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Competenze richieste (separate da virgola)</Label>
                      <Input 
                        id="skills"
                        {...form.register('skills')}
                        placeholder="es. Teamwork, Problem Solving, React..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: STIPENDIO & DETTAGLI */}
                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                      <Euro className="w-5 h-5" />
                      <h2 className="text-xl font-bold">Dettagli dell'offerta</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary_range">Stipendio Previsto</Label>
                        <Input 
                          id="salary_range"
                          placeholder="es. 25k - 30k"
                          {...form.register('salary_range')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Sede di Lavoro (Città)</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            id="location"
                            className="pl-10"
                            {...form.register('location')}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract_type">Tipo di Contratto</Label>
                      <select 
                        id="contract_type"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm"
                        {...form.register('contract_type')}
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Apprendistato</option>
                        <option>Indeterminato</option>
                        <option>Determinato</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: RIEPILOGO */}
                {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold">Tutto pronto!</h2>
                      <p className="text-gray-500">Controlla i dati un'ultima volta prima di pubblicare.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl space-y-3 border border-gray-100">
                      <p><strong>Titolo:</strong> {form.getValues('title')}</p>
                      <p><strong>Luogo:</strong> {form.getValues('location')}</p>
                      <p><strong>Stipendio:</strong> {form.getValues('salary_range')}</p>
                      <p className="text-sm text-gray-600 line-clamp-2"><strong>Descrizione:</strong> {form.getValues('description')}</p>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              <div className="flex justify-between pt-6 border-t border-gray-50">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
                </Button>
                
                {step < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="bg-jobtv-blue px-8">
                    Continua <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-jobtv-gradient px-12 font-bold shadow-lg">
                    PUBBLICA ORA <Rocket className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* MODALE INCORAGGIAMENTO */}
      <Dialog open={showEncouragement} onOpenChange={setShowEncouragement}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Ottima scelta!
            </DialogTitle>
            <DialogDescription className="py-2 text-lg">
              La posizione di <strong>{jobTitle}</strong> è attualmente tra le più cercate. Abbiamo pre-compilato alcuni campi per te.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowEncouragement(false)} className="bg-jobtv-blue w-full">
              Continua a personalizzare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POPUP FINALE DI CONVERSIONE */}
      <Dialog open={showFinalPopup} onOpenChange={(val) => !val && navigate('/company/dashboard')}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
          <div className="bg-jobtv-gradient p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">OFFERTA PUBBLICATA!</h2>
            <p className="text-xl font-medium mb-6 leading-relaxed">
              Vuoi trovare il candidato ideale ancora più velocemente?
            </p>
            <div className="bg-white/10 p-4 rounded-xl mb-8 border border-white/20">
              <p className="text-lg font-bold">
                🎥 ORA REGISTRA VIDEO e OTTIENI IL 95% di visibilità e certezza di trovare il candidato!
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/record-interview')} 
                className="w-full bg-white text-jobtv-blue hover:bg-gray-100 text-lg py-6 font-bold"
              >
                REGISTRA VIDEO AZIENDALE <Video className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/company/dashboard')}
                className="text-white hover:text-white/80"
              >
                Vai alla Dashboard per ora
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CreateJobOffer;