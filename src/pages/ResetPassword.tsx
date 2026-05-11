import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8021';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La password deve contenere almeno 8 caratteri")
      .regex(/[A-Z]/, "La password deve contenere almeno una maiuscola")
      .regex(/[a-z]/, "La password deve contenere almeno una minuscola")
      .regex(/[0-9]/, "La password deve contenere almeno un numero"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Get token from URL
  const token = searchParams.get("token");

  useEffect(() => {
    // Verify token when component mounts
    const verifyToken = async () => {
      if (!token) {
        // Also check for legacy access_token from Supabase
        const accessToken = searchParams.get("access_token");
        if (accessToken) {
          setTokenValid(true);
          return;
        }
        setTokenValid(false);
        toast({
          title: "Link non valido",
          description: "Il link di reset è scaduto o non valido. Richiedi un nuovo reset password.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/forgot-password"), 3000);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/send-email/verify-reset-token?token=${token}`);
        const result = await response.json();

        if (result.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          toast({
            title: "Link non valido",
            description: result.error || "Il link di reset è scaduto o non valido. Richiedi un nuovo reset password.",
            variant: "destructive",
          });
          setTimeout(() => navigate("/forgot-password"), 3000);
        }
      } catch (error) {
        console.error("Token verification error:", error);
        setTokenValid(false);
        toast({
          title: "Errore di verifica",
          description: "Impossibile verificare il link. Riprova.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/forgot-password"), 3000);
      }
    };

    verifyToken();
  }, [token, searchParams, navigate, toast]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      // Check if using legacy Supabase token or new custom token
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");

      if (accessToken && refreshToken) {
        // Legacy Supabase flow
        const { supabase } = await import("@/integrations/supabase/client");

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) throw sessionError;

        const { error } = await supabase.auth.updateUser({
          password: values.password,
        });

        if (error) throw error;
      } else if (token) {
        // New custom token flow
        const response = await fetch(`${API_BASE_URL}/api/send-email/update-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            newPassword: values.password,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to update password');
        }
      } else {
        throw new Error("Token di reset mancante");
      }

      toast({
        title: "Password resettata!",
        description: "La tua password è stata aggiornata con successo. Ora puoi accedere.",
        variant: "default",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Errore",
        description: error?.message || "Si è verificato un errore. Il link potrebbe essere scaduto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <Header />

      <main className="section-padding flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-jobtv-teal/10 rounded-full mb-4">
                <Lock className="w-8 h-8 text-jobtv-teal" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Nuova Password</h1>
              <p className="text-gray-600">
                {tokenValid === null ? "Verifica del link in corso..." : "Inserisci la tua nuova password"}
              </p>
            </div>

            {tokenValid === true && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuova Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conferma Password</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-jobtv-gradient" disabled={loading}>
                  {loading ? "Aggiornamento in corso..." : "Aggiorna Password"}
                </Button>
              </form>
            </Form>
            )}

            <div className="text-center text-sm text-gray-600 mt-6">
              <Link to="/login" className="text-jobtv-blue hover:text-jobtv-teal font-medium">
                ← Torna al login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
