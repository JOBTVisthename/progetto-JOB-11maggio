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
  Rocket,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
  const [isRewriting, setIsRewriting] = useState(false);
  const [tone, setTone] = useState<'formal' | 'creative' | 'friendly'>('formal');
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

  // Ripristino logica predittiva: compila descrizione e skills in base al titolo
  useEffect(() => {
    if (jobTitle && jobTitle.length >= 3 && step === 1) {
      const template = getTemplateByTitle(jobTitle);
      if (template) {
        const values = form.getValues();
        
        // Riempie descrizione e competenze se vuote
        if (!values.description) form.setValue('description', template.description);
        if (!values.skills) form.setValue('skills', template.skills.join(', '));
        
        // Estendiamo il riempimento anche ai campi dello Step 3 se definiti nel template
        // Nota: Assumiamo che l'oggetto template possa contenere questi campi opzionali
        const extendedTemplate = template as any;
        if (!values.salary_range && extendedTemplate.salary_range) {
          form.setValue('salary_range', extendedTemplate.salary_range);
        }
        if (extendedTemplate.contract_type) {
          form.setValue('contract_type', extendedTemplate.contract_type);
        }
      }
    }
  }, [jobTitle, step, form]);

  const handleAiRewrite = async () => {
    const currentDescription = form.getValues('description');
    if (!currentDescription || currentDescription.length < 10) {
      toast({
        title: "Testo troppo breve",
        description: "Scrivi almeno una bozza della descrizione per poterla migliorare con l'AI.",
        variant: "destructive"
      });
      return;
    }

    setIsRewriting(true);
    // Simula ritardo computazione AI
    await new Promise(resolve => setTimeout(resolve, 1500));

    const bulletPoints = currentDescription.split('\n').filter(line => line.trim()).map(line => `• ${line.trim()}`).join('\n');
    let improvedDescription = '';

    switch (tone) {
      case 'creative':
        improvedDescription = `🚀 Sei pronto per una nuova sfida? Stiamo cercando un talentuoso ${jobTitle || 'professionista'} per unirsi al nostro team dinamico!

Cosa farai con noi:
${bulletPoints}

Siamo un'azienda che valorizza l'innovazione e la creatività. Se vuoi lasciare il segno, sei nel posto giusto!`;
        break;
      case 'friendly':
        improvedDescription = `Ciao! 👋 Stiamo cercando un nuovo collega come ${jobTitle || 'collaboratore'} da inserire nel nostro team.

Ecco di cosa ti occuperai:
${bulletPoints}

Siamo un gruppo affiatato e non vediamo l'ora di conoscerti. Se hai voglia di metterti in gioco in un ambiente sereno, scrivici!`;
        break;
      case 'formal':
      default:
        improvedDescription = `Siamo alla ricerca di un profilo altamente qualificato per ricoprire la posizione di ${jobTitle || 'collaboratore'}. 

Principali mansioni e responsabilità:
${bulletPoints}

Il candidato ideale possiede eccellenti capacità organizzative e un forte orientamento ai risultati. Si offre inserimento in un contesto professionale e strutturato.`;
        break;
    }

    form.setValue('description', improvedDescription);
    setIsRewriting(false);
    toast({
      title: "Ottimizzazione completata ✨",
      description: `Testo ottimizzato con tono ${tone === 'formal' ? 'formale' : tone === 'creative' ? 'creativo' : 'amichevole'}.`,
    });
  };

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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description">Mansioni e Responsabilità</Label>
                        <div className="flex items-center gap-2">
                          <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                            <SelectTrigger className="w-[130px] h-8 text-xs border-gray-200">
                              <SelectValue placeholder="Tono" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="formal">Formale</SelectItem>
                              <SelectItem value="creative">Creativo</SelectItem>
                              <SelectItem value="friendly">Amichevole</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            onClick={handleAiRewrite}
                            disabled={isRewriting}
                            className="text-xs h-8 border-jobtv-teal text-jobtv-teal hover:bg-jobtv-teal/5 gap-1.5"
                          >
                            {isRewriting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            Migliora con AI
                          </Button>
                        </div>
                      </div>
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
        <DialogContent className="sm:max-w-sm sm:left-auto sm:right-6 sm:top-6 sm:translate-x-0 sm:translate-y-0 bg-white/95 backdrop-blur-md shadow-2xl border-jobtv-blue/10 border-l-4 border-l-jobtv-teal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-jobtv-teal" />
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
        <DialogContent className="sm:max-w-sm sm:left-auto sm:right-6 sm:top-24 sm:translate-x-0 sm:translate-y-0 p-6 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-jobtv-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 gradient-text uppercase tracking-tight">Offerta Pubblicata!</h2>
            <p className="text-lg font-medium mb-6 leading-relaxed text-gray-700">
              Vuoi trovare il candidato ideale ancora più velocemente?
            </p>
            <div className="bg-jobtv-teal/5 p-4 rounded-xl mb-8 border border-jobtv-teal/10">
              <p className="text-sm font-bold text-jobtv-blue">
                🎥 ORA REGISTRA UN VIDEO e aumenta del 95% la visibilità del tuo annuncio!
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/record-interview')} 
                className="w-full bg-jobtv-gradient text-white text-lg py-6 font-bold shadow-md hover:opacity-90"
              >
                REGISTRA VIDEO AZIENDALE <Video className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/company/dashboard')}
                className="w-full border-gray-200 text-gray-500"
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