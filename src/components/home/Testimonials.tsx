import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, Building, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Marco Bianchi",
      role: "Web Developer",
      image: "/downloaded-images/32.jpg",
      content: "La possibilità di registrare video risposte mi ha permesso di mostrare la mia personalità oltre alle competenze tecniche. Ho trovato il lavoro perfetto in meno di un mese!",
      company: "TechSolutions",
      location: "Milano",
      rating: 5
    },
    {
      name: "Laura Rossi",
      role: "HR Manager",
      image: "/downloaded-images/44.jpg",
      content: "JobTV ci ha aiutato a migliorare il nostro processo di valutazione iniziale, permettendoci di conoscere meglio i profili prima del contatto. Il tempo di recruitment si è ridotto del 60%.",
      company: "Innovate Inc.",
      location: "Roma",
      rating: 5
    },
    {
      name: "Gianni Verdi",
      role: "Product Designer",
      image: "/downloaded-images/67.jpg",
      content: "La funzione di matching mi ha permesso di essere contattato da aziende che non avrei pensato di incontrare. Finalmente un processo selettivo che funziona davvero!",
      company: "DesignLab",
      location: "Torino",
      rating: 5
    },
    {
      name: "Sofia Esposito",
      role: "Marketing Specialist",
      image: "/downloaded-images/28.jpg",
      content: "La video-presentazione ha fatto la differenza e mi ha permesso di farmi conoscere meglio. Ho ricevuto 3 proposte di lavoro nella prima settimana!",
      company: "BrandBoost",
      location: "Bologna",
      rating: 5
    },
    {
      name: "Alessandro Neri",
      role: "Software Engineer",
      image: "/downloaded-images/image1.jpg",
      content: "Dopo mesi di ricerche infruttuose, con JobTV ho trovato l'azienda giusta in poche settimane. Il sistema di matching è incredibilmente accurato.",
      company: "CodeFirst",
      location: "Firenze",
      rating: 5
    },
    {
      name: "Chiara Galli",
      role: "UX Designer",
      image: "/downloaded-images/image2.jpg",
      content: "Come recruiter, JobTV ha trasformato il mio lavoro. Posso valutare i candidati in modo più completo e risparmiare tempo prezioso.",
      company: "UserFocus",
      location: "Napoli",
      rating: 5
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoplay) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex < testimonials.length - 1 ? prevIndex + 1 : 0
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : testimonials.length - 1
    );
    setIsAutoplay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex < testimonials.length - 1 ? prevIndex + 1 : 0
    );
    setIsAutoplay(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoplay(false);
  };

  const visibleTestimonials = 1; // Simplified for mobile responsiveness
  const maxIndex = Math.max(0, testimonials.length - visibleTestimonials);

  return (
    <section className="section-padding bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-teal/10 border border-jobtv-teal/20 text-jobtv-teal text-sm font-medium mb-6">
            <Quote className="w-4 h-4 mr-2" />
            Testimonianze
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text text-balance">
            Storie di Successo
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto text-balance">
            Ecco cosa dicono i nostri utenti dell'esperienza con JobTV
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${(currentIndex * 100)}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100/50 card-hover relative overflow-hidden group">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-jobtv-teal/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Quote icon */}
                    <div className="flex justify-start mb-6">
                      <div className="p-3 rounded-2xl bg-jobtv-teal/10">
                        <Quote className="w-6 h-6 text-jobtv-teal" />
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="h-5 w-5 fill-jobtv-teal text-jobtv-teal" 
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 mb-6 italic text-lg leading-relaxed relative">
                      "{testimonial.content}"
                    </p>

                    {/* Author info */}
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16 border-2 border-gray-100">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback className="bg-gradient-to-br from-jobtv-teal to-jobtv-blue text-white font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                        <p className="text-gray-600 font-medium">{testimonial.role}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                          <div className="flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {testimonial.company}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {testimonial.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg border-gray-200 hover:bg-white hover:scale-110 transition-all duration-300 z-10"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg border-gray-200 hover:bg-white hover:scale-110 transition-all duration-300 z-10"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.slice(0, maxIndex + 1).map((_, index) => (
              <button
                key={index}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === Math.floor(currentIndex) 
                    ? "bg-jobtv-teal w-8" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { value: "98%", label: "Soddisfazione", icon: "⭐" },
            { value: "50k+", label: "Utenti attivi", icon: "👥" },
            { value: "85%", label: "Match di successo", icon: "🎯" },
            { value: "24h", label: "Tempo medio risposta", icon: "⚡" }
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
