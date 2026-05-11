import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Shield, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AiTransparency: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <Header />

      <main className="section-padding">
        <div className="container container-padding max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-blue/10 border border-jobtv-blue/20 text-jobtv-blue text-sm font-medium mb-6">
              <Brain className="w-4 h-4 mr-2" />
              Informativa AI
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Informativa Trasparenza – AI, Inclusione, Fairness
            </h1>
            <p className="text-lg text-gray-600">
              Principi, logiche e garanzie dei sistemi automatizzati Job TV
            </p>
          </div>

          {/* Info Box */}
          <Card className="mb-8 bg-gradient-to-br from-jobtv-teal/5 to-jobtv-blue/5 border-jobtv-teal/20">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                <strong>Scopo e ambito:</strong> Questa informativa esplica i principi, le logiche e le garanzie adottate
                da Job TV in merito ai sistemi automatizzati, AI e decisioni di matching applicate alla selezione del personale.
              </p>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="space-y-6">
            <Section number={1} title="Definizioni / Ambito" icon={<Brain className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>"Algoritmi / sistemi AI / motore di matching":</strong> moduli software che elaborano dati del candidato
                (video, competenze, storia) e attribuiscono punteggi / ordini di preferenza.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Si applica a: processi di ranking, matching, filtri automatici.
              </p>
            </Section>

            <Section number={2} title="Input / Variabili Considerate" icon={<Brain className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed mb-4">Le variabili valutate possono includere:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>dati anagrafici / identità (es. titolo di studio, anni esperienza)</li>
                <li>competenze tecniche / soft skill</li>
                <li>performance nei video (tempi, qualità, chiarezza, risposte)</li>
                <li>feedback da colloqui precedenti, valutazioni, metriche storiche</li>
                <li>dati contestualizzati (località, disponibilità, preferenze)</li>
              </ul>
            </Section>

            <Section number={3} title="Logiche Generali / Limiti" icon={<Shield className="w-5 h-5" />}>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Le logiche sono concepite per ottimizzare il match candidato ↔ azienda, ma <strong>non sono vincolanti</strong></li>
                <li>Esiste sempre <strong>revisione umana</strong> nelle decisioni significative</li>
                <li>I pesi attribuiti alle variabili sono soggetti a tuning e aggiornamenti</li>
                <li>Una descrizione delle dimensioni principali è disponibile (non i dettagli proprietari)</li>
                <li>Il sistema è progettato per <strong>minimizzare discriminazione e bias</strong> e favorire equità</li>
              </ul>
            </Section>

            <Section number={4} title="Supervisione Umana / Fallback" icon={<CheckCircle className="w-5 h-5" />}>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>In ogni processo con esito significativo (es. selezione finale), è prevista <strong>revisione umana</strong></li>
                <li>I candidati hanno diritto di <strong>contestare il risultato</strong>, richiedere spiegazioni, chiedere riesame manuale</li>
              </ul>
            </Section>

            <Section number={5} title="Misure di Mitigazione Bias / Audit" icon={<Shield className="w-5 h-5" />}>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Audit periodici dei risultati per monitorare disparità (es. genere, etnia, età)</li>
                <li>Test di fairness, algoritmi di debiasing, verifica dati di training</li>
                <li>Registro degli interventi, modifiche e versioni algoritmiche</li>
                <li>Valutazione d'impatto privacy (DPIA) sui moduli con rischio elevato</li>
              </ul>
            </Section>

            <Section number={6} title="Trasparenza verso l'Utente" icon={<AlertCircle className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed mb-4">L'utente ha diritto a chiedere:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>spiegazione ragionata del punteggio / matching</li>
                <li>revisione manuale</li>
                <li>informazioni su variabili considerate, logiche generali, limiti del modello</li>
              </ul>
              <Card className="mt-4 bg-jobtv-blue/5 border-jobtv-blue/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-jobtv-blue" />
                    <div className="text-sm text-gray-700">
                      <strong>Modalità per inviare richiesta di contestazione:</strong>{' '}
                      <a href="mailto:algoritmi@jobtv.it" className="text-jobtv-blue hover:text-jobtv-teal underline">algoritmi@jobtv.it</a> {' '}o modulo dedicato
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>

            <Section number={7} title="Responsabilità / Aggiornamenti" icon={<Shield className="w-5 h-5" />}>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Job TV garantisce aggiornamento continuo del modello, monitoraggio e interventi correttivi</li>
                <li>Versione dell'algoritmo / versione del modello sarà datata e tracciata</li>
                <li>Gli utenti saranno informati in caso di aggiornamenti rilevanti che impattano il funzionamento del sistema</li>
              </ul>
            </Section>

            <Section number={8} title="Normativa Italiana / Obblighi di Legge" icon={<AlertCircle className="w-5 h-5" />}>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    In ottemperanza alla Legge 132/2025 sull'Intelligenza Artificiale in ambito lavorativo:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>garantire obblighi di trasparenza ai candidati / lavoratori selezionati tramite AI</li>
                    <li>comunicare logiche, impatti, parametri</li>
                    <li>effettuare valutazioni di impatto e controlli preventivi</li>
                    <li>interagire con organismi di vigilanza, rappresentanze sindacali e autorità competenti</li>
                  </ul>
                </CardContent>
              </Card>
            </Section>

            {/* Contact Card */}
            <Card className="bg-gradient-to-br from-jobtv-teal/5 to-jobtv-blue/5 border-jobtv-teal/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-jobtv-teal mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Per informazioni o contestazioni</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Algoritmi: <a href="mailto:algoritmi@jobtv.it" className="text-jobtv-blue hover:text-jobtv-teal underline">algoritmi@jobtv.it</a></div>
                      <div>Privacy: <a href="mailto:privacy@jobtv.it" className="text-jobtv-blue hover:text-jobtv-teal underline">privacy@jobtv.it</a></div>
                      <div>DPO: <a href="mailto:dpo@jobtv.it" className="text-jobtv-blue hover:text-jobtv-teal underline">dpo@jobtv.it</a></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface SectionProps {
  number: number;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ number, title, icon, children }) => (
  <Card className="card-hover">
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-jobtv-teal text-white rounded-full flex items-center justify-center font-bold">
          {number}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            {title}
            {icon && <span className="ml-2 text-jobtv-teal">{icon}</span>}
          </h2>
          {children}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AiTransparency;
