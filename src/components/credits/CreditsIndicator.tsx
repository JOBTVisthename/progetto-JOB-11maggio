import { Link } from 'react-router-dom';
import { Target, Crown, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

interface CreditsIndicatorProps {
  className?: string;
}

export default function CreditsIndicator({ className = '' }: CreditsIndicatorProps) {
  const { user } = useAuth();
  const { creditsInfo, loading, refresh } = useCredits();

  // Refresh on mount
  useEffect(() => {
    refresh();
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <Target className="h-4 w-4" />
        <span>Caricamento...</span>
      </div>
    );
  }

  // No subscription - show upgrade prompt
  if (!creditsInfo?.hasSubscription) {
    return (
      <Link to="/pricing-plans">
        <Button variant="outline" size="sm" className="text-xs h-8">
          <Target className="h-4 w-4 mr-1" />
          Attiva un piano
        </Button>
      </Link>
    );
  }

  // Unlimited plan (Hero)
  if (creditsInfo.isUnlimited) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
          <Crown className="h-3 w-3 mr-1" />
          Illimitati
        </Badge>
        <span className="text-xs text-gray-500 font-medium">[{creditsInfo.planType?.toUpperCase()}]</span>
      </div>
    );
  }

  // Limited plans (Starter, Builder)
  const remaining = creditsInfo.remaining ?? 0;
  const viewed = creditsInfo.viewed ?? 0;
  const total = remaining + viewed;

  // Determine color based on remaining credits
  const getVariant = () => {
    if (remaining === 0) return 'destructive';
    if (remaining <= 5) return 'secondary';
    return 'default';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getVariant()} className="font-normal">
        <Target className="h-3 w-3 mr-1" />
        {remaining}/{total}
      </Badge>
      <span className="text-xs text-gray-500 font-medium">[{creditsInfo.planType?.toUpperCase()}]</span>
      {remaining <= 5 && remaining > 0 && (
        <Link to="/pricing-plans">
          <Button variant="ghost" size="sm" className="text-xs h-7 text-orange-600 hover:text-orange-700">
            <Zap className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </Link>
      )}
      {remaining === 0 && (
        <Link to="/pricing-plans">
          <Button variant="destructive" size="sm" className="text-xs h-7">
            Rinnova ora
          </Button>
        </Link>
      )}
    </div>
  );
}
