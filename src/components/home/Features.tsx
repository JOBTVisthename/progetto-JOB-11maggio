import { Video, Clock, Heart, MessageSquare, Zap, Shield } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Video className="h-8 w-8" />,
      title: "Video Presentazioni",
      description: "Registra brevi video per raccontare chi sei e mostrare la tua personalità quando preferisci.",
      color: "text-jobtv-teal",
      bgColor: "bg-jobtv-teal/10"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Matching Intelligente",
      description: "Un algoritmo suggerisce possibili compatibilità tra profili, basandosi sulle informazioni fornite dagli utenti.",
      color: "text-jobtv-blue",
      bgColor: "bg-jobtv-blue/10"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Sistema di Like",
      description: "Aziende e candidati possono esprimere interesse reciproco tramite un semplice \"Mi piace\".",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Messaggistica Diretta",
      description: "Quando il match è confermato, si attiva un canale di comunicazione diretta all'interno della piattaforma.",
      color: "text-jobtv-green",
      bgColor: "bg-jobtv-green/10"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Risparmio di Tempo",
      description: "Riduci i passaggi preliminari e lascia che siano i contenuti video a valorizzare il tuo profilo.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Profili Verificati",
      description: "Gli account aziendali sono verificati per garantire un ambiente digitale sicuro e affidabile.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto container-padding">
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bgColor} ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-jobtv-teal/5 to-jobtv-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 animate-slide-up">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-8 rounded-3xl bg-gradient-to-r from-jobtv-teal/10 to-jobtv-blue/10 border border-white/50 backdrop-blur-sm">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pronto a iniziare?</h3>
              <p className="text-gray-600">Unisciti a migliaia di professionisti che già usano JobTV</p>
            </div>
            <div className="flex space-x-4">
              <button className="jobtv-button">
                Inizia Gratis
              </button>
              <button className="jobtv-button-outline">
                Scopri di più
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
