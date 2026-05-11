import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Andrea",
      company: "La Cristalleria",
      content:
        "Sono Andrea della Cristalleria di Milano, cercavo una figura per il mio store, ho fatto un VIDEO annuncio su JOBTV e 20 candidati hanno messo like alla mia offerta! Fantastico!!!",
      rating: 5,
    },
    {
      name: "Alessia",
      company: "Risto Jobs",
      content:
        "Noi con RISTOJOB cerchiamo personale per il comparto ristorazione in Italia ma soprattutto all'estero, e con JOBTV ho contattato subito tanti candidati per le nostre esigenze.",
      rating: 5,
    },
    {
      name: "",
      company: "Goldbet Monza",
      content:
        "Cercavo una ragazza da mettere come front desk, e con JOBTV in meno di 24 ore ho ricevuto il contatto di 15 candidati. Consigliatissimo!",
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoplay, testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1));
    setIsAutoplay(false);
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));
    setIsAutoplay(false);
  };
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoplay(false);
  };

  const getInitials = (name: string, company: string) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase();
    return company.split(" ").map((c) => c[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <section className="section-padding bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5">
      <div className="container mx-auto container-padding">
        <div className="text-center max-w-4xl mx-auto mb-20 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-teal/10 border border-jobtv-teal/20 text-jobtv-teal text-sm font-medium mb-6">
            <Quote className="w-4 h-4 mr-2" />
            Testimonianze
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text text-balance">
            Storie di Successo
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto text-balance">
            Ecco cosa dicono le aziende che hanno scelto JobTV
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((t, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100/50 card-hover relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-jobtv-teal/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="flex justify-start mb-6">
                      <div className="p-3 rounded-2xl bg-jobtv-teal/10">
                        <Quote className="w-6 h-6 text-jobtv-teal" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-jobtv-teal text-jobtv-teal" />
                      ))}
                    </div>

                    <p className="text-gray-700 mb-6 italic text-lg leading-relaxed relative">
                      "{t.content}"
                    </p>

                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16 border-2 border-gray-100">
                        <AvatarFallback className="bg-gradient-to-br from-jobtv-teal to-jobtv-blue text-white font-semibold">
                          {getInitials(t.name, t.company)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {t.name && (
                          <h4 className="font-bold text-gray-900 text-lg">{t.name}</h4>
                        )}
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Building className="w-3 h-3 mr-1" />
                          {t.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg border-gray-200 hover:bg-white hover:scale-110 transition-all duration-300 z-10"
            onClick={handlePrev}
            aria-label="Recensione precedente"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg border-gray-200 hover:bg-white hover:scale-110 transition-all duration-300 z-10"
            onClick={handleNext}
            aria-label="Recensione successiva"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-jobtv-teal w-8" : "bg-gray-300 hover:bg-gray-400 w-3"
                }`}
                onClick={() => handleDotClick(index)}
                aria-label={`Vai alla recensione ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats row — "Tempo medio risposta" rimosso, utenti attivi aggiornato a 169.000 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            { value: "98%", label: "Soddisfazione", icon: "⭐" },
            { value: "169.000", label: "Utenti attivi", icon: "👥" },
            { value: "85%", label: "Match di successo", icon: "🎯" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white shadow-lg card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
