import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserCheck, FileText, Heart, MessageSquare, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Registrati",
      description: "Crea il tuo account gratuito come candidato o come azienda in pochi semplici passaggi.",
      color: "from-jobtv-teal to-jobtv-blue",
      icon: <UserCheck className="w-6 h-6" />
    },
    {
      number: "02",
      title: "Completa il Profilo",
      description: "Candidati: Carica il CV e registra i video. Aziende: Inserisci i dettagli del tuo profilo aziendale.",
      color: "from-jobtv-blue to-jobtv-lightblue",
      icon: <FileText className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Trova Compatibilità",
      description: "Le aziende possono visualizzare i profili candidati e indicare interesse con un \"Mi piace\".",
      color: "from-jobtv-lightblue to-jobtv-purple",
      icon: <Heart className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Inizia a Comunicare",
      description: "Se l'interesse è reciproco, si apre una conversazione diretta sulla piattaforma.",
      color: "from-jobtv-purple to-jobtv-teal",
      icon: <MessageSquare className="w-6 h-6" />
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50/50 to-white">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-blue/10 border border-jobtv-blue/20 text-jobtv-blue text-sm font-medium mb-6">
            <ArrowRight className="w-4 h-4 mr-2" />
            Processo Semplice
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 inline-block">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text text-balance leading-tight">
              Quattro Semplici Passaggi
            </h2>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto text-balance mt-6">
            Dal profilo al colloquio di lavoro, ecco come funziona JobTV per candidati e aziende
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-1 bg-gradient-to-r from-jobtv-teal via-jobtv-blue to-jobtv-purple rounded-full opacity-30"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Number Badge */}
                <div className="flex justify-center mb-8">
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white`}>
                    {step.number}
                  </div>
                </div>
                
                {/* Content Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg card-hover border border-gray-100/50 pt-16 relative overflow-hidden group">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${step.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-4 relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                    style={{ backgroundImage: `linear-gradient(to right, ${step.color.split(" ")[0].replace("from-", "")}, ${step.color.split(" ")[1].replace("to-", "")})` }}>
                  </div>
                </div>

                {/* Mobile connection line */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute top-16 left-full w-full h-0.5 bg-gradient-to-r opacity-30" 
                    style={{ 
                      backgroundImage: `linear-gradient(to right, ${step.color.split(" ")[0].replace("from-", "")}, ${steps[index + 1].color.split(" ")[0].replace("from-", "")})` 
                    }}>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { value: "2 min", label: "Tempo di registrazione" },
            { value: "24h", label: "Approvazione profilo" },
            { value: "95%", label: "Tasso di successo" },
            { value: "1000+", label: "Match giornalieri" }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-2xl bg-white shadow-md card-hover animate-slide-up"
              style={{ animationDelay: `${(index + 4) * 0.1}s` }}
            >
              <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-slide-up">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-8 rounded-3xl bg-gradient-to-r from-jobtv-teal/10 to-jobtv-blue/10 border border-white/50 backdrop-blur-sm">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pronto a iniziare?</h3>
              <p className="text-gray-600">Unisciti a migliaia di professionisti che già usano JobTV</p>
            </div>
            <Button asChild className="jobtv-button group">
              <Link to="/register">
                Inizia Ora
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
