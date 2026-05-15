import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, MessageCircle, Instagram } from "lucide-react";
import GuidedChatBot from "@/components/ui/GuidedChatBot";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white pt-16 pb-8 border-t border-gray-200">
      <div className="container container-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/22cef828-ede7-4f25-bfea-00cc5ada1a2a.png" 
                alt="JobTV Logo" 
                className="h-10 w-auto transition-transform hover:scale-110" 
              />
              <span className="font-bold text-2xl gradient-text">
                JobTV
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              La piattaforma innovativa che collega candidati e aziende attraverso video interviste e matching intelligente.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/job_tv_app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jobtv-blue hover:text-jobtv-teal transition-all duration-300 hover:scale-110"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://wa.me/393807590948"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-600 transition-all duration-300 hover:scale-110"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Collegamenti rapidi</h3>
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Home
              </Link>
              <Link 
                to="/for-companies" 
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Per le aziende
              </Link>
              <Link 
                to="/for-candidates" 
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Per i candidati
              </Link>
              <Link 
                to="/pricing-plans" 
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Piani
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Chi siamo
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Contatti
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Link Utili</h3>
            <nav className="flex flex-col space-y-3">
              <Link
                to="/terms"
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Termini e Condizioni
              </Link>
              <Link
                to="/privacy"
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                to="/cookie"
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Cookie Policy
              </Link>
              <Link
                to="/ai-transparency"
                className="text-gray-600 hover:text-jobtv-teal transition-colors duration-300 font-medium"
              >
                Informativa AI
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Contatti</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <MapPin className="text-jobtv-teal flex-shrink-0 h-5 w-5 mt-0.5 group-hover:text-jobtv-blue transition-colors" />
                <div className="text-gray-600">
                  <div className="font-semibold text-gray-900 mb-1">JOB TV ITALIA srl</div>
                  <div className="text-sm">PARTITA IVA 14375330967</div>
                  <div className="mt-3">
                    <div className="font-semibold text-gray-900 mb-1">Sede Legale</div>
                    <div className="text-sm">Via Mazzini 3/c - 20063 - Cernusco Sul Naviglio (Mi)</div>
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-gray-900 mb-1">Sede Operativa</div>
                    <div className="text-sm">Viale Filippo Meda, 23, 20017 Rho (MI)</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <Phone className="text-jobtv-teal flex-shrink-0 h-5 w-5 group-hover:text-jobtv-blue transition-colors" />
                <div className="text-gray-600">
                  <a 
                    href="tel:+393807590948" 
                    className="font-medium text-gray-900 hover:text-jobtv-teal transition-colors"
                  >
                    +39 380 759 0948
                  </a>
                  <div className="text-sm text-gray-500">Lun-Ven 9:00-18:00</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <Mail className="text-jobtv-teal flex-shrink-0 h-5 w-5 group-hover:text-jobtv-blue transition-colors" />
                <div className="text-gray-600">
                  <a 
                    href="mailto:mail%20CEO@JOBTV.IT" 
                    className="font-medium text-gray-900 hover:text-jobtv-teal transition-colors"
                  >
                    mail CEO@JOBTV.IT
                  </a>
                  <div className="text-sm text-gray-500">Risposta entro 24h</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <MessageCircle className="text-green-500 flex-shrink-0 h-5 w-5 group-hover:text-green-600 transition-colors" />
                <div className="text-gray-600">
                  <a 
                    href="https://wa.me/393807590948" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-900 hover:text-green-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <div className="text-sm text-gray-500">Supporto immediato</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2026 JobTV. Tutti i diritti riservati.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Made with ❤️ in Italy</span>
              <span>•</span>
              <span>P.IVA 14375330967</span>
            </div>
          </div>
        </div>
      </div>

      <GuidedChatBot />
    </footer>
  );
}
