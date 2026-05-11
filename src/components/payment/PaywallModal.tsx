import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Star, Check, Crown, Target } from 'lucide-react';
import { PRICING_PLANS, PlanId, redirectToCheckout, isStripeConfigured } from '@/integrations/stripe/stripeService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId?: string;
  candidateName?: string;
  previewData?: {
    name: string;
    position?: string;
    location?: string;
    experience?: string;
  };
  onUnlock?: () => void;
  isUnlocking?: boolean;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  previewData,
  onUnlock,
  isUnlocking = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getCreditsInfo } = useCredits();
  const { toast } = useToast();

  const creditsInfo = getCreditsInfo();
  const hasSubscription = creditsInfo?.hasSubscription;
  const remainingCredits = creditsInfo?.remaining ?? 0;
  const isUnlimited = creditsInfo?.isUnlimited;
  const planType = creditsInfo?.planType;

  const handlePlanSelect = async (planId: PlanId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      toast({
        title: "Stripe non configurato",
        description: "Il sistema di pagamento non è configurato.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Close modal and redirect to Stripe Checkout
      onClose();
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
        description: error instanceof Error ? error.message : "Si è verificato un errore.",
        variant: "destructive",
      });
    }
  };

  const handleViewPricing = () => {
    onClose();
    navigate('/pricing-plans');
  };

  const QuickPlanCard = ({ planId, icon }: { planId: PlanId; icon: React.ReactNode }) => {
    const plan = PRICING_PLANS[planId];

    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handlePlanSelect(planId)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            {icon}
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">€{plan.price}</span>
            <span className="text-sm text-muted-foreground ml-1">/mese</span>
          </div>
          {plan.originalPrice && (
            <div className="text-xs text-muted-foreground line-through">
              €{plan.originalPrice}/mese
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2 text-sm">
            {plan.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Sblocca Dettagli Completi del Candidato
          </DialogTitle>
          <DialogDescription>
            {candidateName 
              ? `Per visualizzare le informazioni complete di ${candidateName}, scegli un piano abbonamento.`
              : 'Per visualizzare le informazioni complete dei candidati, scegli un piano abbonamento.'
            }
          </DialogDescription>
        </DialogHeader>

        {previewData && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Anteprima Limitata
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nome:</span> {previewData.name}
              </div>
              {previewData.position && (
                <div>
                  <span className="font-medium">Posizione:</span> {previewData.position}
                </div>
              )}
              {previewData.location && (
                <div>
                  <span className="font-medium">Località:</span> {previewData.location}
                </div>
              )}
              {previewData.experience && (
                <div>
                  <span className="font-medium">Esperienza:</span> {previewData.experience}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Attiva un abbonamento per vedere contatti, curriculum video completo, e molto altro...
            </p>
          </div>
        )}

        {/* Credits indicator and unlock option for users with subscription */}
        {hasSubscription && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {isUnlimited ? 'Piano Illimitato' : `Crediti Rimanenti: ${remainingCredits}`}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {isUnlimited
                    ? 'Con il piano Hero hai accesso illimitato ai candidati'
                    : remainingCredits > 0
                      ? `Sblocca questo candidato utilizzando 1 credito`
                      : 'Limite mensile raggiunto - Effettua l\'upgrade del piano'
                  }
                </p>
              </div>
              {onUnlock && remainingCredits > 0 && (
                <Button
                  onClick={onUnlock}
                  disabled={isUnlocking}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUnlocking ? 'Sblocco in corso...' : 'Sblocca (1 credito)'}
                </Button>
              )}
            </div>
            {planType && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Piano attuale: <Badge variant="outline" className="text-xs ml-1">{planType.toUpperCase()}</Badge>
              </p>
            )}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Scegli il Tuo Piano</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <QuickPlanCard 
              planId="starter" 
              icon={<Badge variant="secondary">Base</Badge>} 
            />
            <QuickPlanCard 
              planId="builder" 
              icon={
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Popolare
                </Badge>
              } 
            />
            <QuickPlanCard 
              planId="hero" 
              icon={
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              } 
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={handleViewPricing} className="flex-1">
            Confronta Tutti i Piani
          </Button>
          <Button onClick={() => handlePlanSelect('builder')} className="flex-1">
            Inizia con Builder (Più Popolare)
          </Button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🚀 Inizia Subito
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Accesso immediato a tutti i candidati</li>
            <li>• Nessun contratto a lungo termine</li>
            <li>• Annulla quando vuoi</li>
            <li>• Supporto prioritario</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallModal;
