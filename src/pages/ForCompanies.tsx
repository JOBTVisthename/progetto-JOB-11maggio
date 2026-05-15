import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Search, ThumbsUp, MessageSquare } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const ForCompanies = () => {
  const benefits = [
    "Accesso a una banca dati di candidati pre-qualificati",
    "Visualizzazione di video interviste per conoscere i candidati",
    "Sistema di matching per trovare i talenti più adatti",
    "Riduzione dei tempi di assunzione",
    "Messaggistica diretta con i candidati interessati",
    "Gestione centralizzata del processo di selezione",
    "Analisi dettagliate sulle campagne di recruiting",
    "Supporto dedicato per l'intero processo"
  ];
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 pb-32"> {/* Aggiunto pb-32 per evitare sovrapposizione chat */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Per le Aziende</h1>
            <p className="text-lg text-gray-600">
              Trova i talenti giusti per far crescere la tua azienda con JobTV
            </p>
            
            <div className="mt-6">
              <Button asChild className="bg-jobtv-gradient">
                <Link to="/search-candidates">
                  <Search className="mr-2 h-4 w-4" />
                  Cerca Candidati Ora
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-16">
            <div className="md:flex">
              <div className="md:w-1/2 bg-jobtv-gradient p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">Vantaggi per le Aziende</h2>
                
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button asChild className="bg-white text-jobtv-blue hover:bg-gray-100 h-auto py-4 px-6 text-left flex flex-col items-start rounded-lg shadow-xl group border-2 border-jobtv-teal animate-pulse">
                    <Link to="/create-job-offer">
                      <span className="text-xs font-bold opacity-70 uppercase mb-1">Sei un'Azienda?</span>
                      <span className="text-sm md:text-base font-extrabold leading-tight">CREA LA TUA OFFERTA DI LAVORO <span className="underline decoration-2 underline-offset-4 group-hover:text-jobtv-teal transition-colors">CLICCANDO QUI</span></span>
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="md:w-1/2 p-8">
                <h2 className="text-2xl font-bold mb-6">Perché Scegliere JobTV</h2>
                <p className="text-gray-600 mb-8">
                  JobTV rivoluziona il processo di selezione del personale, consentendoti di vedere i candidati in azione prima ancora di intervistarli.
                </p>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-10 h-10 rounded-full bg-jobtv-teal/10 flex items-center justify-center">
                        <Search className="h-5 w-5 text-jobtv-teal" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Ricerca Avanzata</h3>
                      <p className="text-gray-600 text-sm">
                        Filtra i candidati per competenze, esperienza, disponibilità e molto altro.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-10 h-10 rounded-full bg-jobtv-teal/10 flex items-center justify-center">
                        <ThumbsUp className="h-5 w-5 text-jobtv-teal" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Matching Semplificato</h3>
                      <p className="text-gray-600 text-sm">
                        Esprimi interesse con un semplice "Mi piace" e attendi la risposta del candidato.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-10 h-10 rounded-full bg-jobtv-teal/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-jobtv-teal" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Comunicazione Diretta</h3>
                      <p className="text-gray-600 text-sm">
                        Una volta stabilito il match, comunica direttamente con i candidati sulla piattaforma.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Come Funziona</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-jobtv-gradient rounded-full flex items-center justify-center text-white font-bold mb-4">1</div>
                <h3 className="text-xl font-semibold mb-3">Registrati</h3>
                <p className="text-gray-600">
                  Crea un account aziendale e inserisci le informazioni sulla tua azienda.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-jobtv-gradient rounded-full flex items-center justify-center text-white font-bold mb-4">2</div>
                <h3 className="text-xl font-semibold mb-3">Cerca Candidati</h3>
                <p className="text-gray-600">
                  Utilizza i filtri avanzati per trovare i candidati più adatti alle tue esigenze.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-jobtv-gradient rounded-full flex items-center justify-center text-white font-bold mb-4">3</div>
                <h3 className="text-xl font-semibold mb-3">Visualizza Video</h3>
                <p className="text-gray-600">
                  Guarda le video interviste per conoscere meglio i candidati prima di contattarli.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-jobtv-gradient rounded-full flex items-center justify-center text-white font-bold mb-4">4</div>
                <h3 className="text-xl font-semibold mb-3">Contatta i Match</h3>
                <p className="text-gray-600">
                  Metti "Mi piace" ai profili interessanti e inizia a comunicare con i candidati che ricambiano.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 mb-16 border border-blue-100">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">Nota di compliance</h3>
            <p className="text-blue-800 text-sm">
              JobTV è un servizio digitale che mette a disposizione strumenti tecnologici per facilitare il contatto diretto tra aziende e candidati. La piattaforma non svolge attività di intermediazione, ricerca e selezione del personale, né somministrazione di lavoro ai sensi del D.Lgs. 276/2003.
            </p>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Pronto a Trovare i Migliori Talenti?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Unisciti alle aziende che hanno già rivoluzionato il loro processo di selezione grazie a JobTV.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button asChild className="bg-jobtv-gradient">
                <Link to="/register">Registrati Come Azienda</Link>
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

export default ForCompanies;
