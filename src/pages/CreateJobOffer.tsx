import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button, ButtonProps } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Video, Send, Sparkles, Building2, Clock, DollarSign, FileText, Loader2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Modelli per auto-completamento basati sul titolo
const JOB_TEMPLATES: Record<string, { skills: string, duties: string, description: string }> = {
  "Sviluppatore": {
    skills: "React, TypeScript, Node.js, Database SQL, Git",
    duties: "Sviluppo frontend/backend, manutenzione codice, partecipazione a sprint di progettazione.",
    description: "Siamo alla ricerca di uno Sviluppatore appassionato per unirsi al nostro team innovativo. Ti occuperai di creare interfacce utente scalabili e performanti."
  },
  "Operaio": {
    skills: "Utilizzo macchinari industriali, sicurezza sul lavoro, precisione",
    duties: "Conduzione linee di produzione, controllo qualità, movimentazione carichi.",
    description: "Ricerchiamo personale operativo per il potenziamento del nostro reparto produttivo. Richiesta massima serietà e attenzione alle norme di sicurezza."
  },
  "Commerciale": {
    skills: "Vendita B2B, CRM, negoziazione, ottime doti relazionali",
    duties: "Sviluppo nuovo business, gestione trattative, analisi del mercato territoriale.",
    description: "Cerchiamo una figura commerciale intraprendente per l'espansione della nostra rete vendita. Il candidato ideale ha un forte orientamento al risultato."
  },
  "Amministrativo": {
    skills: "Contabilità, fatturazione, pacchetto Office, gestione scadenze",
    duties: "Supporto ufficio amministrazione, archiviazione documenti, gestione comunicazioni.",
    description: "Inserimento in organico per gestione contabile e amministrativa. Necessaria precisione e ottima conoscenza degli strumenti informatici d'ufficio."
  }
};

const CreateJobOffer = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [duties, setDuties] = useState('');
  const [location, setLocation] = useState('');
  const [workHours, setWorkHours] = useState('full-time');
  const [salaryMin, setSalaryMin] = useState<number | null>(null);
  const [salaryMax, setSalaryMax] = useState<number | null>(null);
  const [salaryRange, setSalaryRange] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Effetto per l'auto-completamento intelligente
  useEffect(() => {
    if (title.length > 3) {
      const match = Object.keys(JOB_TEMPLATES).find(key => 
        title.toLowerCase().includes(key.toLowerCase())
      );
      
      if (match) {
        setSkills(JOB_TEMPLATES[match].skills);
        setDuties(JOB_TEMPLATES[match].duties);
        setDescription(JOB_TEMPLATES[match].description);
        toast({
          title: "Suggerimenti JobTV",
          description: `Abbiamo rilevato il ruolo di "${match}" e suggerito competenze e mansioni.`,
        });
        // Tentativo di parsare lo stipendio dal template se presente
        const salaryMatch = JOB_TEMPLATES[match].description.match(/(\d{2,3})k - (\d{2,3})k/);
        if (salaryMatch) {
          setSalaryMin(parseInt(salaryMatch[1]) * 1000);
          setSalaryMax(parseInt(salaryMatch[2]) * 1000);
          setSalaryRange(`${salaryMatch[1]}k - ${salaryMatch[2]}k`);
        } else {
          setSalaryMin(null);
          setSalaryMax(null);
          setSalaryRange('');
        }
      }
    }
  }, [title, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('job_offers')
        .insert({
          company_id: user.id,
          title,
          description,
          location,
          work_hours: workHours,
          salary_min: salaryMin,
          salary_max: salaryMax,
          salary_range: salaryRange,
          skills: skills.split(',').map(s => s.trim()),
          duties,
          video_url: videoUrl,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Annuncio Pubblicato!",
        description: "Il tuo annuncio è attivo. Ora registra un video per presentarlo al meglio.",
      });
      navigate('/company/dashboard');
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile pubblicare l'annuncio: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-jobtv-gradient p-8 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <Building2 className="w-8 h-8" />
                <h1 className="text-3xl font-bold uppercase tracking-tight">Crea Nuova Posizione</h1>
              </div>
              <p className="opacity-90">Compila il form per creare una nuova posizione di lavoro.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-jobtv-teal" />
                  Titolo Posizione *
                </label>
                <Input 
                  placeholder="Es: Sviluppatore Frontend Senior" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border-gray-200 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <FileText className="w-4 h-4 mr-1 text-jobtv-teal" />
                  Descrizione
                </label>
                <Textarea 
                  placeholder="Descrivi la posizione, le responsabilità e ciò che rende questa opportunità unica..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Luogo di Lavoro</label>
                  <Input 
                    placeholder="es. Milano, Italia" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-jobtv-teal" />
                    Orario di Lavoro
                  </label>
                  <Select value={workHours} onValueChange={setWorkHours}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleziona orario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="turni">Turni</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-jobtv-teal" />
                  Stipendio Previsto
                </label>
                <Input 
                  placeholder="es. 35.000 - 45.000 EUR annui" 
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-jobtv-teal" />
                    Stipendio Minimo (€/anno)
                  </label>
                  <Input 
                    type="number"
                    placeholder="es. 35000" 
                    value={salaryMin || ''}
                    onChange={(e) => setSalaryMin(e.target.value ? parseInt(e.target.value) : null)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-jobtv-teal" />
                    Stipendio Massimo (€/anno)
                  </label>
                  <Input 
                    type="number"
                    placeholder="es. 45000" 
                    value={salaryMax || ''}
                    onChange={(e) => setSalaryMax(e.target.value ? parseInt(e.target.value) : null)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Competenze Richieste (Separa con virgola)</label>
                <Textarea 
                  placeholder="es. React, TypeScript, Node.js, SQL" 
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Mansioni e Responsabilità</label>
                <Textarea 
                  placeholder="Elenco delle principali mansioni e responsabilità..." 
                  value={duties}
                  onChange={(e) => setDuties(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-4 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <label className="text-sm font-bold text-gray-700 block">Video Presentazione (Opzionale)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/record-interview')}
                    className="flex-1 h-12 border-jobtv-teal text-jobtv-teal hover:bg-jobtv-teal/5"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Registra Video
                  </Button>
                  <div className="flex-[2] flex gap-2">
                    <Input 
                      placeholder="Carica URL Video (YouTube, Vimeo...)" 
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="h-12 flex-1"
                    />
                    <Button type="button" variant="ghost" className="h-12"><Upload className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button type="submit" disabled={loading} className="flex-1 h-14 text-lg font-bold bg-jobtv-blue hover:bg-blue-700 rounded-xl">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  CREA POSIZIONE
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => navigate('/company/dashboard')}
                  className="h-14 font-bold text-gray-500"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateJobOffer;