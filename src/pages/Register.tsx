import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { User, Building2, ArrowRight, CheckCircle } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5">
      <Header />

      <main className="section-padding">
        <div className="container container-padding">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Come vuoi registrarti?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scegli il tipo di account più adatto alle tue esigenze
            </p>
          </div>

          {/* Registration Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Candidate Card */}
            <Link
              to="/register/candidate"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-jobtv-teal/20"
            >
              <div className="flex flex-col h-full">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-jobtv-teal/10 group-hover:bg-jobtv-teal/20 transition-colors mb-6">
                  <User className="w-10 h-10 text-jobtv-teal" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-jobtv-teal transition-colors">
                  Candidato
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 flex-grow">
                  Cerchi lavoro? Crea il tuo profilo, carica il video CV e fatti scoprire dalle aziende più innovative.
                </p>

                {/* Benefits */}
                <ul className="space-y-3 mb-6">
                  {[
                    "Video CV personalizzabile",
                    "Match automatici con le aziende",
                    "Interviste video dirette",
                    "Dashboard per gestire le candidature"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-jobtv-teal mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center text-jobtv-teal font-semibold group-hover:translate-x-2 transition-transform">
                  Registrati come Candidato
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* Company Card */}
            <Link
              to="/register/company"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-jobtv-blue/20"
            >
              <div className="flex flex-col h-full">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-jobtv-blue/10 group-hover:bg-jobtv-blue/20 transition-colors mb-6">
                  <Building2 className="w-10 h-10 text-jobtv-blue" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-jobtv-blue transition-colors">
                  Azienda
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 flex-grow">
                  Cerchi talenti? Registrati e accedi a database di candidati qualificati con video CV.
                </p>

                {/* Benefits */}
                <ul className="space-y-3 mb-6">
                  {[
                    "Accesso al database candidati",
                    "Ricerca avanzata per competenze",
                    "Sistema di matching intelligente",
                    "Gestione centralizzata delle candidature"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-jobtv-blue mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center text-jobtv-blue font-semibold group-hover:translate-x-2 transition-transform">
                  Registrati come Azienda
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>

          {/* Already have account */}
          <div className="text-center mt-12 text-gray-600">
            Hai già un account?{" "}
            <Link to="/login" className="text-jobtv-blue hover:text-jobtv-teal font-medium">
              Accedi
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
