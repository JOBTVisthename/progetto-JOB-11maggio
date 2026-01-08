import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the email confirmation redirect from Supabase
    const handleEmailConfirmation = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          navigate("/login", { replace: true });
          return;
        }

        if (data.session) {
          // Email confirmed, redirect to confirmation page
          navigate("/email-confirmation", { replace: true });
        } else {
          // No session, redirect to login
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        navigate("/login", { replace: true });
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-jobtv-blue/10 via-white to-jobtv-teal/10 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 text-jobtv-teal animate-spin mx-auto" />
        <p className="text-gray-600">Conferma email in corso...</p>
      </div>
    </div>
  );
}
