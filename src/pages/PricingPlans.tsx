import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, ArrowRight, HelpCircle, Shield, Info } from 'lucide-react';
import { PRICING_PLANS, PlanId, redirectToCheckout, isStripeConfigured } from '@/integrations/stripe/stripeService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PricingPlans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<PlanId | null>(null);
  const [userType, setUserType] = React.useState<'candidate' | 'company' | null>(null);
  const [checkingType, setCheckingType] = React.useState(true);

  // Check user type on mount
  React.useEffect(() => {
    const checkUserType = async () => {
      if (!user) {
        setCheckingType(false);
        return;
      }

      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserType(data.user_type);
        }
      } catch (error) {
        console.error('Error checking user type:', error);
      } finally {
        setCheckingType(false);
      }
    };

    checkUserType();
  }, [user]);

  const handlePlanSelect = async (planId: PlanId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is a candidate
    if (userType === 'candidate') {
      toast({
        title: "Aziende solo",
        description: "Gli abbonamenti sono riservati alle aziende. I candidati possono utilizzare la piattaforma gratuitamente.",
        variant: "destructive",
      });
      return;
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      toast({
        title: "Stripe non configurato",
        description: "Il sistema di pagamento non è configurato. Contatta l'amministratore.",
        variant: "destructive",
      });
      return;
    }

    setLoading(planId);

    try {
      // Verify user profile exists before checkout
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Profilo non trovato",
          description: "Il tuo profilo non è stato trovato. Prova a effettuare il logout e login novamente.",
          variant: "destructive",
        });
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      await redirectToCheckout({
        planId,
        userId: user.id,
        userEmail: user.email,
        successUrl: `${window.location.origin}/profile?tab=subscription&success=true`,
        cancelUrl: `${window.location.origin}/pricing-plans`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Errore nel checkout",
        description: error instanceof Error ? error.message : "Si è verificato un errore durante il processo di pagamento.",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  const PlanCard = ({ planId, isPopular = false }: { planId: PlanId; isPopular?: boolean }) => {
    const plan = PRICING_PLANS[planId];
    const isLoading = loading === planId;
    const isDisabled = userType === 'candidate' || checkingType;

    return (
      <Card className={`relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
        isPopular
          ? 'border-jobtv-teal shadow-xl scale-105 bg-gradient-to-br from-white to-jobtv-teal/5'
          : 'border-border hover:border-jobtv-teal/50'
      }`}>
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="bg-jobtv-gradient text-white px-6 py-2 rounded-full shadow-lg animate-pulse-slow">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Più Popolare
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold gradient-text mb-2">{plan.name}</CardTitle>
          <CardDescription className="text-lg text-gray-600 mb-6">
            Piano perfetto per {plan.idealFor.toLowerCase()}
          </CardDescription>

          <div className="mt-6 mb-8">
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-bold gradient-text">€{plan.price}</span>
              <span className="text-xl text-gray-500 ml-2">/{plan.interval}</span>
            </div>
            {plan.originalPrice && (
              <div className="text-lg text-gray-400 line-through mt-2">
                €{plan.originalPrice}/{plan.interval}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <ul className="space-y-4 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start group/item">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 group-hover/item:bg-green-200 transition-colors">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className={`w-full text-lg py-4 rounded-xl font-semibold transition-all duration-300 group ${
              isPopular
                ? 'jobtv-button shadow-lg hover:shadow-xl'
                : 'border-2 border-jobtv-teal text-jobtv-teal hover:bg-jobtv-teal hover:text-white'
            }`}
            onClick={() => handlePlanSelect(planId)}
            disabled={isLoading || isDisabled}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Elaborazione...
              </>
            ) : isDisabled && userType === 'candidate' ? (
              <>
                Aziende Solo
                <Shield className="ml-2 h-5 w-5" />
              </>
            ) : user ? (
              <>
                Scegli Piano
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                Accedi per Scegliere
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <Header />

      <main className="section-padding">
        <div className="container container-padding">
          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text text-balance">
              Scegli il Piano Perfetto per Te
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto text-balance mb-8">
              Tutti i piani includono accesso completo alla nostra piattaforma video e matching intelligente.
              Nessun costo nascosto, annulla in qualsiasi momento.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="w-5 h-5 text-jobtv-teal" />
                <span className="font-medium">Pagamenti Sicuri</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Check className="w-5 h-5 text-jobtv-teal" />
                <span className="font-medium">Annulla Quando Vuoi</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <HelpCircle className="w-5 h-5 text-jobtv-teal" />
                <span className="font-medium">Supporto 24/7</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {/* Banner for candidates */}
            {user && userType === 'candidate' && (
              <div className="lg:col-span-3 mb-8">
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Devi essere registrato come Azienda</h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                          Per abbonarsi, devi avere un profilo aziendale. Se ti sei registrato come candidato, registrati nuovamente come azienda.
                        </p>
                        <Link to="/register?type=company">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Vai alla Registrazione Azienda
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <PlanCard planId="starter" />
            <PlanCard planId="builder" isPopular={true} />
            <PlanCard planId="hero" />
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 gradient-text">Domande Frequenti</h2>
              <p className="text-gray-600 text-lg">Tutto quello che devi sapere sui nostri piani</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  question: "Posso cambiare piano in qualsiasi momento?",
                  answer: "Sì, puoi passare a un piano superiore o inferiore in qualsiasi momento. Il cambiamento sarà effettivo dal prossimo ciclo di fatturazione."
                },
                {
                  question: "Quali metodi di pagamento accettate?",
                  answer: "Accettiamo tutte le principali carte di credito, PayPal e bonifici bancari per piani annuali."
                },
                {
                  question: "È previsto un periodo di prova gratuito?",
                  answer: "Sì, tutti i nuovi utenti possono usufruire di una prova gratuita di 14 giorni su qualsiasi piano."
                },
                {
                  question: "Come funziona l'annullamento?",
                  answer: "Puoi annullare il tuo abbonamento in qualsiasi momento con un semplice clic. Continuerai a usufruire del servizio fino alla fine del periodo pagato."
                }
              ].map((faq, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900 group-hover:text-jobtv-teal transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-16">
            <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-jobtv-teal/5 to-jobtv-blue/5 border-jobtv-teal/20">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold mb-4 gradient-text">Hai bisogno di aiuto?</h3>
                  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Il nostro team di esperti è qui per aiutarti a scegliere il piano migliore per le tue esigenze specifiche.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="jobtv-button px-8 py-4">
                    <HelpCircle className="mr-2 h-5 w-5" />
                    Contatta il Supporto
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 py-4 rounded-xl border-2">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Scopri le Funzionalità
                  </Button>
                </div>

                <div className="mt-8 flex items-center justify-center space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Supporto via email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Supporto via chat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Supporto telefonico</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPlans;
