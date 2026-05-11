import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8021';

const forgotPasswordSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      // Use our custom SMTP endpoint instead of Supabase
      const response = await fetch(`${API_BASE_URL}/api/send-email/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          redirectUrl: `${window.location.origin}/reset-password`
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset email');
      }

      setSuccess(true);
      toast({
        title: "Email inviata!",
        description: result.message || "Se l'email è associata a un account, riceverai un link per resettare la password.",
        variant: "default",
      });

    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Errore",
        description: error?.message || "Si è verificato un errore. Riprova più tardi.",
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
          {/* Back button */}
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 hover:text-jobtv-blue mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Torna al login
          </Link>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-jobtv-teal/10 rounded-full mb-4">
                <Mail className="w-8 h-8 text-jobtv-teal" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Dimenticata</h1>
              <p className="text-gray-600">
                {success
                  ? "Controlla la tua email per il link di reset."
                  : "Inserisci la tua email e ti invieremo un link per resettare la password."}
              </p>
            </div>

            {!success && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="nome@esempio.com"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-jobtv-gradient" disabled={loading}>
                    {loading ? "Invio in corso..." : "Invia link di reset"}
                  </Button>
                </form>
              </Form>
            )}

            {success && (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 font-medium">
                    ✓ Email inviata con successo!
                  </p>
                  <p className="text-green-700 text-sm mt-2">
                    Controlla la tua casella di posta e clicca sul link per resettare la password.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setSuccess(false);
                    form.reset();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Invia un'altra email
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mt-6">
              Ricordi la password?{" "}
              <Link to="/login" className="text-jobtv-blue hover:text-jobtv-teal font-medium">
                Torna al login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
