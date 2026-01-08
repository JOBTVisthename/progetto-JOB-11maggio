import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);

      // Show success message
      toast({
        title: "Login effettuato",
        description: "Bentornato su JobTV!",
        variant: "default",
      });

      // Fetch user profile and redirect
      setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();

          if (profile?.user_type === 'company') {
            navigate("/company/dashboard");
          } else {
            navigate("/dashboard");
          }
        } else {
          navigate("/");
        }

        setLoading(false);
      }, 500);

    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Credenziali non valide. Riprova.";

      if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = "Email o password non corretti. Controlla le credenziali e riprova.";
      } else if (error?.message?.includes('Email not confirmed')) {
        errorMessage = "Email non confermata. Per favore controlla la tua email e clicca sul link di conferma.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Errore di login",
        description: errorMessage,
        variant: "destructive",
      });

      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Bentornato</h2>
        <p className="text-gray-600 mt-2">Accedi al tuo account JobTV</p>
      </div>

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
                    placeholder="email@esempio.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-jobtv-blue hover:text-jobtv-teal">
                    Password dimenticata?
                  </Link>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-jobtv-gradient" disabled={loading}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Non hai un account?{" "}
            <Link to="/register" className="text-jobtv-blue hover:text-jobtv-teal font-medium">
              Registrati
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
