// ============================================================================
// SubscriptionManagement Component
// Allows users to manage their subscription, view usage, and make changes
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Settings,
  ExternalLink,
  Video,
  Users,
  MessageSquare,
  Heart,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import {
  getUserSubscription,
  getSubscriptionUsage,
  cancelSubscription,
  redirectToPortal,
  type PlanId,
  PRICING_PLANS,
  getDaysRemaining,
  formatDate,
} from '@/integrations/stripe/stripeService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionManagementProps {
  onManageBilling?: () => void;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ onManageBilling }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [subData, usageData] = await Promise.all([
        getUserSubscription(user.id),
        // Only fetch usage if we have a subscription
        getUserSubscription(user.id).then(async (sub) => {
          if (sub) {
            return getSubscriptionUsage(sub.id);
          }
          return null;
        }),
      ]);

      setSubscription(subData);
      setUsage(usageData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('Sei sicuro di voler cancellare l\'abbonamento? Continuerai ad avere accesso fino alla fine del periodo corrente.')) {
      return;
    }

    setCancelling(true);
    try {
      await cancelSubscription(subscription.stripe_subscription_id);
      await fetchData();
      toast({
        title: "Abbonamento cancellato",
        description: "L'abbonamento sarà disattivato alla fine del periodo corrente",
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Errore",
        description: "Impossibile cancellare l'abbonamento",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;

    try {
      await redirectToPortal({ userId: user.id });
    } catch (error) {
      console.error('Error opening portal:', error);
      toast({
        title: "Errore",
        description: "Impossibile aprire il portale di gestione",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;

    const status = subscription.status;
    const isCancelled = subscription.cancel_at_period_end;

    if (isCancelled) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          <XCircle className="w-3 h-3 mr-1" />
          Si cancella al termine
        </Badge>
      );
    }

    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Attivo
          </Badge>
        );
      case 'trialing':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Video className="w-3 h-3 mr-1" />
            In prova
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pagamento dovuto
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUsagePercentage = (used: number, remaining: number | null) => {
    if (remaining === null) return 0; // Unlimited
    const total = used + remaining;
    return total > 0 ? (used / total) * 100 : 0;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Il Tuo Abbonamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jobtv-teal"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nessun Abbonamento Attivo</CardTitle>
          <CardDescription>
            Scegli un piano per iniziare ad usare JobTV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="jobtv-button">
            <a href="/pricing">
              Vedi i Piani
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const plan = PRICING_PLANS[subscription.plan_type as PlanId];
  const daysRemaining = getDaysRemaining(subscription.current_period_end);

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-jobtv-teal" />
                Il Tuo Abbonamento
              </CardTitle>
              <CardDescription>
                Gestisci il tuo abbonamento JobTV
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-jobtv-teal/5 to-jobtv-blue/5 rounded-lg">
            <div>
              <div className="text-2xl font-bold gradient-text">{plan.name}</div>
              <div className="text-gray-600">€{plan.price}/mese</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Prossimo rinnovo</div>
              <div className="font-semibold">
                {formatDate(subscription.current_period_end)}
              </div>
              <div className="text-xs text-gray-500">
                {daysRemaining} giorni rimanenti
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleManageBilling}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Gestisci Fatturazione
            </Button>
            {!subscription.cancel_at_period_end && (
              <Button
                variant="ghost"
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {cancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Elaborazione...
                  </>
                ) : (
                  'Cancella Abbonamento'
                )}
              </Button>
            )}
          </div>

          {subscription.cancel_at_period_end && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800">Abbonamento in cancellazione</p>
                  <p className="text-sm text-orange-700">
                    Il tuo abbonamento sarà disattivato il {formatDate(subscription.current_period_end)}.
                    Puoi riattivarlo prima di tale data dalla sezione gestione fatturazione.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-jobtv-teal" />
              Utilizzo Questo Mese
            </CardTitle>
            <CardDescription>
              Periodo: {formatDate(usage.period_start)} - {formatDate(usage.period_end)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Videos Posted */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Video Pubblicati</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.videos_posted}
                  {usage.videos_remaining !== null && ` / ${usage.videos_posted + usage.videos_remaining}`}
                  {usage.videos_remaining === null && ' (Illimitati)'}
                </span>
              </div>
              {usage.videos_remaining !== null && (
                <Progress
                  value={getUsagePercentage(usage.videos_posted, usage.videos_remaining)}
                  className="h-2"
                />
              )}
            </div>

            {/* Profiles Viewed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Profili Visti</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.profiles_viewed}
                  {usage.profiles_remaining !== null && ` / ${usage.profiles_viewed + usage.profiles_remaining}`}
                  {usage.profiles_remaining === null && ' (Illimitati)'}
                </span>
              </div>
              {usage.profiles_remaining !== null && (
                <Progress
                  value={getUsagePercentage(usage.profiles_viewed, usage.profiles_remaining)}
                  className="h-2"
                />
              )}
            </div>

            {/* Messages Sent */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Messaggi Inviati</span>
                </div>
                <span className="text-sm text-gray-600">{usage.messages_sent}</span>
              </div>
            </div>

            {/* Matches Made */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Match Effettuati</span>
                </div>
                <span className="text-sm text-gray-600">{usage.matches_made}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Funzionalità del Piano {plan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
