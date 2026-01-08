import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Users, CheckCircle, Star } from "lucide-react";

export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-jobtv-teal via-jobtv-blue to-jobtv-purple relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full filter blur-2xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto container-padding relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-8 mb-16 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              Inizia Subito
            </div>

            {/* Main heading */}
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white text-balance leading-tight">
              Pronto a Sfruttare il Potenziale di JobTV?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto text-balance mb-8">
              Unisciti a migliaia di professionisti che utilizzano la piattaforma per 
              <span className="font-bold text-white">presentarsi</span> e 
              <span className="font-bold text-white">connettersi</span> in modo innovativo.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "50k+ Utenti",
                description: "Professionisti attivi sulla piattaforma"
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: "95% Match Rate",
                description: "Tasso di successo elevato"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "4.9/5 Rating",
                description: "Valutazione eccellente"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center animate-slide-up border border-white/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-white mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-6 mb-12">
            <Button 
              asChild 
              className="jobtv-button text-lg px-10 py-4 bg-white text-jobtv-teal hover:bg-gray-100 group shadow-2xl"
            >
              <Link to="/register" className="flex items-center">
                Registrati Ora
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-jobtv-teal transition-all duration-300 px-10 py-4 text-lg rounded-full"
            >
              <Link to="/for-candidates" className="flex items-center">
                Scopri di Più
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/80">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Nessuna carta di credito richiesta</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Registrazione gratuita</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Annullamento in qualsiasi momento</span>
            </div>
          </div>

          {/* Social proof */}
          <div className="text-center pt-8 border-t border-white/20">
            <div className="flex items-center justify-center space-x-2 text-white/60 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium">Voto eccellente da oltre 10,000 utenti</span>
            </div>
            <p className="text-white/70 text-sm italic">
              "JobTV ha trasformato completamente il modo in cui trovo opportunità professionali. 
              Altamente raccomandato!"
            </p>
            <div className="text-white/60 text-sm mt-2">
              - Marco Rossi, Senior Developer
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-transparent to-white/10"></div>
    </section>
  );
}
