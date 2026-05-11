// ============================================================================
// PaymentHistory Component
// Displays user's payment history with invoices
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Download, FileText, Calendar, CreditCard, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { getPaymentHistory, type PaymentRecord, formatCurrency, formatDate } from '@/integrations/stripe/stripeService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentHistoryProps {
  limit?: number;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ limit = 20 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user, limit]);

  const fetchPayments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getPaymentHistory(user.id, limit);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare la cronologia dei pagamenti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'refunded':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Receipt className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: PaymentRecord['status']) => {
    const variants: Record<PaymentRecord['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      succeeded: 'default',
      failed: 'destructive',
      pending: 'secondary',
      refunded: 'outline',
      partial_refund: 'outline',
    };

    const labels: Record<PaymentRecord['status'], string> = {
      succeeded: 'Completato',
      failed: 'Fallito',
      pending: 'In attesa',
      refunded: 'Rimborsato',
      partial_refund: 'Rimborso parziale',
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    );
  };

  const getPaymentTypeLabel = (type: PaymentRecord['payment_type']) => {
    switch (type) {
      case 'subscription':
        return 'Abbonamento';
      case 'one_time':
        return 'Pagamento unico';
      case 'trial':
        return 'Periodo di prova';
      default:
        return type;
    }
  };

  const downloadInvoice = async (payment: PaymentRecord) => {
    // For Stripe invoices, we would fetch the PDF from Stripe
    // For now, show a toast message
    if (payment.stripe_invoice_id) {
      toast({
        title: "Download fattura",
        description: "Il download della fattura sarà disponibile dopo l'integrazione completa con Stripe",
      });
    } else {
      toast({
        title: "Fattura non disponibile",
        description: "Questo pagamento non ha una fattura associata",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cronologia Pagamenti</CardTitle>
          <CardDescription>Caricamento in corso...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jobtv-teal"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-jobtv-teal" />
              Cronologia Pagamenti
            </CardTitle>
            <CardDescription>
              {payments.length > 0
                ? `Mostrati ${payments.length} pagamenti`
                : 'Nessun pagamento registrato'}
            </CardDescription>
          </div>
          {payments.length > 0 && (
            <Button variant="outline" size="sm" onClick={fetchPayments}>
              <FileText className="w-4 h-4 mr-2" />
              Aggiorna
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nessun pagamento registrato</p>
            <p className="text-sm text-gray-400 mt-2">
              I tuoi pagamenti appariranno qui dopo aver effettuato un acquisto
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setExpandedPayment(expandedPayment === payment.id ? null : payment.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(payment.status)}
                      <Badge variant="outline">
                        {getPaymentTypeLabel(payment.payment_type)}
                      </Badge>
                      {payment.refunded_amount > 0 && (
                        <Badge variant="secondary" className="text-blue-600">
                          Rimborsato: {formatCurrency(payment.refunded_amount)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-semibold text-lg">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(payment.created_at)}
                      </div>
                      {payment.period_start && payment.period_end && (
                        <div className="text-gray-500">
                          Periodo: {formatDate(payment.period_start)} - {formatDate(payment.period_end)}
                        </div>
                      )}
                    </div>
                    {payment.description && (
                      <p className="text-sm text-gray-600 mt-2">{payment.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadInvoice(payment);
                    }}
                    disabled={!payment.stripe_invoice_id}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Expanded details */}
                {expandedPayment === payment.id && (
                  <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500">ID Pagamento:</span>
                        <p className="font-mono text-xs">{payment.id}</p>
                      </div>
                      {payment.stripe_payment_intent_id && (
                        <div>
                          <span className="text-gray-500">Stripe Payment Intent:</span>
                          <p className="font-mono text-xs">{payment.stripe_payment_intent_id}</p>
                        </div>
                      )}
                      {payment.stripe_invoice_id && (
                        <div>
                          <span className="text-gray-500">Fattura Stripe:</span>
                          <p className="font-mono text-xs">{payment.stripe_invoice_id}</p>
                        </div>
                      )}
                      {payment.subscription_id && (
                        <div>
                          <span className="text-gray-500">ID Abbonamento:</span>
                          <p className="font-mono text-xs">{payment.subscription_id}</p>
                        </div>
                      )}
                    </div>
                    {payment.refund_reason && (
                      <div>
                        <span className="text-gray-500">Motivo rimborso:</span>
                        <p className="text-gray-700">{payment.refund_reason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
