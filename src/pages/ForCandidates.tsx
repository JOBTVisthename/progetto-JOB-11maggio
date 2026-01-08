
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const ForCandidates = () => {
  const benefits = [
    "Crea un profilo professionale completo",
    "Carica il tuo curriculum vitae",
    "Registra brevi video di presentazione",
    "Fatti scoprire dalle aziende che utilizzano JobTV",
    "Gestisci facilmente tutte le comunicazioni con i recruiter",
    "Tieni tutte le tue candidature in un unico posto",
    "Accedi a opportunità pubblicate direttamente dalle aziende"
  ];

  const videoQuestions = [
    'Qual è il tuo nome completo?',
    'Qual è il titolo di lavoro che desideri?',
    'Quando sei nato/a?',
    'In quale paese vivi attualmente?',
    'In quale città vivi attualmente?',
    'In quale provincia/stato vivi?',
    'Da quanto tempo stai cercando lavoro?',
    'Qual è la tua preferenza di spostamento?',
    'Sei disposto/a a trasferirti?',
    'Sei disposto/a a cambiare regione?',
    'Qual è la tua disponibilità di inizio?',
    'Sei disponibile a lavorare nei fine settimana?',
    'Sei disponibile per lavoro a turni?'
  ];
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Per i Candidati</h1>
            <p className="text-lg text-gray-600">
              Trova la tua prossima opportunità professionale con JobTV
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-16">
            <div className="md:flex">
              <div className="md:w-1/2 bg-jobtv-gradient p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">Vantaggi per i Candidati</h2>
                
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button asChild className="bg-white text-jobtv-blue hover:bg-gray-100">
                    <Link to="/register">Inizia Ora</Link>
                  </Button>
                </div>
              </div>
              
              <div className="md:w-1/2 p-8">
                <h2 className="text-2xl font-bold mb-6">La Tua Video Intervista</h2>
                <p className="text-gray-600 mb-6">
                  Dopo la registrazione, potrai rispondere a queste domande tramite brevi video che ti aiuteranno a presentarti alle aziende:
                </p>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {videoQuestions.map((question, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      {index + 1}. {question}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Come Funziona</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-jobtv-gradient rounded-full flex items-center justify-center text-white font-bold mb-4">1</div>
                <h3 className="text-xl font-semibold mb-3">Registrati</h3>
                <p className="text-gray-600">
                  Crea un account gratuito su JobTV e completa il tuo profilo professionale.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-jobtv-gradient rounded-full flex items-center justify-center text-white font-bold mb-4">2</div>
                <h3 className="text-xl font-semibold mb-3">Registra i Video</h3>
                <p className="text-gray-600">
                  Rispondi alle domande della video intervista per mostrare la tua personalità.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-jobtv-gradient rounded-full flex items-center justify-center text-white font-bold mb-4">3</div>
                <h3 className="text-xl font-semibold mb-3">Ricevi Match</h3>
                <p className="text-gray-600">
                  Le aziende visualizzeranno il tuo profilo e potranno inviarti proposte di lavoro.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 mb-16 border border-blue-100">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">Nota di compliance</h3>
            <p className="text-blue-800 text-sm">
              JobTV è una piattaforma tecnologica che facilita il contatto diretto tra candidati e aziende. Non svolge attività di intermediazione o selezione del personale.
            </p>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Pronto a Iniziare?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Unisciti a migliaia di professionisti che hanno già trovato il lavoro dei loro sogni grazie a JobTV.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button asChild className="bg-jobtv-gradient">
                <Link to="/register">Registrati Come Candidato</Link>
              </Button>
              <Button asChild variant="outline" className="border-jobtv-teal text-jobtv-teal">
                <Link to="/login">Accedi</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForCandidates;
