import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Play, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5 section-padding">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-jobtv-teal/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-jobtv-blue/10 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-jobtv-green/10 rounded-full filter blur-2xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto container-padding relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          <div className="space-y-8 text-center lg:text-left animate-slide-in-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-teal/10 border border-jobtv-teal/20 text-jobtv-teal text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              La nuova era del recruiting
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance gradient-text text-shadow-lg">
                Scopri nuove opportunità professionali con JobTV
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 text-balance">
                La piattaforma digitale che connette candidati e aziende attraverso video-presentazioni innovative e strumenti di matching intelligenti.
              </p>
            </div>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto lg:mx-0">
              <div className="glass-effect rounded-2xl shadow-xl p-2 flex items-center">
                <div className="flex-grow">
                  <input 
                    type="text" 
                    placeholder="Cerca lavoro, competenze, aziende..." 
                    className="w-full px-6 py-4 border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-800 placeholder-gray-500"
                  />
                </div>
                <Button className="jobtv-button rounded-xl px-6 py-4">
                  <Search className="mr-2 h-5 w-5" />
                  <span className="font-semibold">Cerca</span>
                </Button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
              <Button asChild className="jobtv-button text-lg px-8 py-4">
                <Link to="/for-candidates">
                  <Play className="mr-2 h-5 w-5" />
                  Per i candidati
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="jobtv-button-outline text-lg px-8 py-4">
                <Link to="/for-companies">
                  Per le aziende
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8 pt-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-jobtv-teal rounded-full"></div>
                <span className="text-sm font-medium">1000+ candidati</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-jobtv-blue rounded-full"></div>
                <span className="text-sm font-medium">500+ aziende</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-jobtv-green rounded-full"></div>
                <span className="text-sm font-medium">95% match rate</span>
              </div>
            </div>
          </div>

          {/* Right side - Images */}
          <div className="relative hidden lg:block animate-slide-in-right">
            {/* Floating cards with animations */}
            <div className="relative w-full h-[600px] flex items-center justify-center">
              {/* Main card */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-white rounded-3xl shadow-2xl p-3 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <img loading="lazy" decoding="async" 
                    src="/lovable-uploads/amilcare.jpeg"
                    alt="Amilcare"
                    className="rounded-2xl w-64 h-auto shadow-lg"
                  />
                </div>
              </div>

              {/* Secondary card */}
              <div className="absolute top-1/4 right-0 transform translate-x-8 -translate-y-8 z-10">
                <div className="bg-white rounded-2xl shadow-xl p-2 transform -rotate-6 hover:-rotate-3 transition-transform duration-300">
                  <img loading="lazy" decoding="async" 
                    src="/downloaded-images/image1.jpg"
                    alt="Young professionals"
                    className="rounded-xl w-40 h-40 object-cover"
                  />
                </div>
              </div>

              {/* Tertiary card */}
              <div className="absolute bottom-1/4 left-0 transform -translate-x-8 translate-y-8 z-10">
                <div className="bg-white rounded-2xl shadow-xl p-2 transform rotate-6 hover:rotate-3 transition-transform duration-300">
                  <img loading="lazy" decoding="async" 
                    src="/downloaded-images/image2.jpg"
                    alt="Job applicant"
                    className="rounded-xl w-48 h-32 object-cover"
                  />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-1/4 w-20 h-20 bg-jobtv-teal/20 rounded-full blur-xl animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-jobtv-blue/20 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}
