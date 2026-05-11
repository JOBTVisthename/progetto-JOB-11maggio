import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import ErrorDisplay from "./ui/ErrorDisplay";
import { Check, Loader2, User, Mail, MapPin, Phone, Lock, Eye, EyeOff, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { z } from "zod";

// Schema per candidati - TUTTI I CAMPI OBBLIGATORI tranne email
const candidateRegisterSchema = z.object({
  email: z.string().min(1, "Email richiesta").email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  confirmPassword: z.string().min(6, "Conferma la password"),
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  city: z.string().min(2, "La città deve avere almeno 2 caratteri"),
  phone: z.string().min(5, "Il telefono è troppo corto"),
})
  .refine(data => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

type CandidateRegisterFormValues = z.infer<typeof candidateRegisterSchema>;

export default function CandidateRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<CandidateRegisterFormValues>({
    resolver: zodResolver(candidateRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      city: "",
      phone: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  const watchedFields = form.watch();
  const formState = form.formState;

  const onSubmit = async (values: CandidateRegisterFormValues) => {
    setLoading(true);
    setError(null);

    console.log("=== REGISTRAZIONE CANDIDATO ===");
    console.log("Dati form:", values);
    console.log("Tipo: CANDIDATO");
    console.log("============================");

    try {
      const metadata = {
        user_type: "candidate",
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        city: values.city.trim(),
        phone: values.phone.trim(),
      };

      console.log("📤 Metadata inviati a Supabase:", metadata);

      const result = await signUp(
        values.email.trim().toLowerCase(),
        values.password,
        "candidate",
        metadata
      );

      console.log("✅ Registrazione completata:", result);

      // Redirect al dashboard candidati
      navigate("/dashboard");
    } catch (error: any) {
      console.error("❌ Errore registrazione:", error);
      setError(error?.message || "Si è verificato un errore durante la registrazione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Card - CANDIDATO */}
      <div className="mb-6 p-4 bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10 rounded-xl border-2 border-jobtv-teal/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-jobtv-teal to-jobtv-green rounded-lg shadow-md">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-jobtv-teal">Account Candidato</h2>
            <p className="text-sm text-gray-600">Ti stai registrando per CERCARE LAVORO</p>
          </div>
        </div>
      </div>

      {/* Badge di tipo account */}
      <div className="mb-6 flex items-center justify-center gap-2 px-4 py-2 bg-jobtv-teal/20 rounded-full border border-jobtv-teal/30">
        <User className="w-4 h-4 text-jobtv-teal" />
        <span className="text-sm font-semibold text-jobtv-teal">PROFILO CANDIDATO</span>
      </div>

      <ErrorDisplay error={error} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Sezione: Dati Personali */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <User className="w-4 h-4 text-jobtv-teal" />
              <span className="text-sm font-semibold text-gray-700">Dati Personali</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mario"
                        {...field}
                        autoComplete="given-name"
                        className="border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cognome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rossi"
                        {...field}
                        autoComplete="family-name"
                        className="border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sezione: Contatti */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Mail className="w-4 h-4 text-jobtv-teal" />
              <span className="text-sm font-semibold text-gray-700">Contatti</span>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                      <Input
                        type="email"
                        placeholder="mario.rossi@email.com"
                        className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                        {...field}
                        autoComplete="email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Città *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                        <Input
                          placeholder="Milano"
                          className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                          {...field}
                          autoComplete="address-level2"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                        <Input
                          type="tel"
                          placeholder="+39 333..."
                          className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                          {...field}
                          autoComplete="tel"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sezione: Password */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Lock className="w-4 h-4 text-jobtv-teal" />
              <span className="text-sm font-semibold text-gray-700">Password</span>
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Almeno 6 caratteri"
                        className="pl-10 pr-10 border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                        {...field}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <FormLabel>Conferma Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ripeti la password"
                        className="pl-10 pr-10 border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                        {...field}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button - CANDIDATO */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-jobtv-teal to-jobtv-green hover:opacity-90 shadow-lg hover:shadow-xl transition-all h-12 text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Registrazione in corso...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Crea Account Candidato
              </>
            )}
          </Button>

          {/* Info links */}
          <div className="text-center text-sm space-y-2 pt-2">
            <div className="text-gray-600">
              Hai già un account?{" "}
              <Link to="/login" className="text-jobtv-teal hover:text-jobtv-teal/80 font-medium">
                Accedi
              </Link>
            </div>
            <div>
              <Link to="/register/company" className="text-gray-500 hover:text-jobtv-blue">
                Sei un'azienda? Registrati come azienda →
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
