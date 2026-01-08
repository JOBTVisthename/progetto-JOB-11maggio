import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCVUpload, setPendingCVUpload] = useState(false);
  const [cvFileName, setCvFileName] = useState<string>("");

  useEffect(() => {
    // Check if there's a pending CV upload
    const pendingCV = sessionStorage.getItem('pendingCVUpload');
    const cvName = sessionStorage.getItem('cvFileName');
    if (pendingCV === 'true') {
      setPendingCVUpload(true);
      setCvFileName(cvName || "");
    }

    // Check if user has confirmed email
    const checkConfirmation = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Check if email is confirmed
          if (session.user.email_confirmed_at) {
            setConfirmed(true);
            setLoading(false);

            // Clean up sessionStorage
            sessionStorage.removeItem('pendingCVUpload');
            sessionStorage.removeItem('cvFileName');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              // Check user type to redirect to appropriate dashboard
              const userType = session.user.user_metadata?.user_type;
              if (userType === 'company') {
                navigate('/company/dashboard');
              } else {
                navigate('/dashboard');
              }
            }, 2000);
          } else {
            // Still waiting for confirmation
            setLoading(false);
          }
        } else {
          // No session, user needs to verify email first
          setLoading(false);
          setError("Nessuna sessione trovata. Per favore controlla la tua email e clicca sul link di conferma.");
        }
      } catch (err: any) {
        setError(err.message || "Si è verificato un errore");
        setLoading(false);
      }
    };

    checkConfirmation();
  }, [navigate]);

  const handleResendEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.auth.resend({
          type: 'signup',
          email: user.email!,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        alert("Email di conferma reinviata! Controlla la tua casella di posta.");
      }
    } catch (err: any) {
      alert("Errore nell'invio dell'email: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jobtv-blue/10 via-white to-jobtv-teal/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 text-jobtv-teal animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Verifica in corso...</h2>
            <p className="text-gray-600">Stiamo verificando la tua email.</p>
          </div>
        ) : confirmed ? (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email Confermata!</h2>
            <p className="text-gray-600">
              La tua email è stata confermata con successo. Verrai reindirizzato alla dashboard tra pochi secondi...
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-jobtv-gradient"
            >
              Vai alla Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-jobtv-blue/10 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-jobtv-blue" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Conferma la tua Email</h2>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600">
                  Abbiamo inviato un'email di conferma al tuo indirizzo email. Per favore clicca sul link che abbiamo inviato per completare la registrazione.
                </p>

                {pendingCVUpload && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <p className="font-medium text-blue-900">CV pendente</p>
                    </div>
                    <p className="text-sm text-blue-800">
                      Dopo aver confermato la tua email, potrai caricare il tuo CV: <span className="font-medium">{cvFileName}</span>
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-3 pt-4">
              <p className="text-sm text-gray-500">
                Non hai ricevuto l'email? Controlla anche nella cartella spam.
              </p>

              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
              >
                Invia di nuovo l'email
              </Button>

              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                className="w-full text-gray-600 hover:text-jobtv-blue"
              >
                Torna al Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
