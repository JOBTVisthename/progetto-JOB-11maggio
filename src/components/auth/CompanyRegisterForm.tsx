import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import ErrorDisplay from "./ui/ErrorDisplay";
import { Check, Loader2, Building2, Mail, MapPin, Phone, Lock, Eye, EyeOff, Building, AlertCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { z } from "zod";
import { fetchCompanyDataByVAT, isValidItalianVAT } from "@/services/companyDataService";

// Schema per aziende - TUTTI I CAMPI OBBLIGATORI
const companyRegisterSchema = z.object({
  email: z.string().min(1, "Email richiesta").email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  confirmPassword: z.string().min(6, "Conferma la password"),
  companyName: z.string().min(2, "Il nome azienda deve avere almeno 2 caratteri"),
  city: z.string().min(2, "La città deve avere almeno 2 caratteri"),
  phone: z.string().min(5, "Il telefono è troppo corto"),
  vat: z.string().min(11, "La P.IVA deve avere 11 cifre").max(20, "P.IVA non valida"),
  sdi: z.string().optional().nullable(),
})
  .refine(data => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

type CompanyRegisterFormValues = z.infer<typeof companyRegisterSchema>;

interface PopUpState {
  show: boolean;
  title: string;
  message: string;
}

export default function CompanyRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [popUp, setPopUp] = useState<PopUpState>({ show: false, title: "", message: "" });
  const [vatLoading, setVatLoading] = useState(false);
  const [vatLoaded, setVatLoaded] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<CompanyRegisterFormValues>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      city: "",
      phone: "",
      vat: "",
      sdi: "",
    },
    mode: "onBlur",
  });

  // Funzione per auto-riempire i dati dalla P.IVA
  const handleVatBlur = async (vatValue: string) => {
    if (!isValidItalianVAT(vatValue)) return;

    setVatLoading(true);
    try {
      const companyData = await fetchCompanyDataByVAT(vatValue);
      if (companyData.found) {
        form.setValue("companyName", companyData.name);
        form.setValue("city", companyData.city);
        if (companyData.sdi) {
          form.setValue("sdi", companyData.sdi);
        }
        setVatLoaded(true);
      }
    } catch (error) {
      console.error("Errore nel recupero dati P.IVA:", error);
    } finally {
      setVatLoading(false);
    }
  };

  const showPhonePopUp = () => {
    setPopUp({
      show: true,
      title: "📱 Numero di Telefono",
      message: "Il numero di telefono è obbligatorio e viene utilizzato per inviarti notifiche più rapidamente riguardo ai nuovi match e alle candidature ricevute."
    });
  };

  const onSubmit = async (values: CompanyRegisterFormValues) => {
    setLoading(true);
    setError(null);

    console.log("=== REGISTRAZIONE AZIENDA ===");
    console.log("Dati form:", values);
    console.log("Tipo: AZIENDA");
    console.log("==========================");

    try {
      const metadata = {
        user_type: "company",
        company_name: values.companyName.trim(),
        city: values.city.trim(),
        phone: values.phone.trim(),
        vat: values.vat.trim(),
        sdi: values.sdi?.trim() || null,
      };

      console.log("📤 Metadata inviati a Supabase:", metadata);

      const result = await signUp(
        values.email.trim().toLowerCase(),
        values.password,
        "company",
        metadata
      );

      console.log("✅ Registrazione completata:", result);

      // Redirect al dashboard aziende
      navigate("/company/dashboard");
    } catch (error: any) {
      console.error("❌ Errore registrazione:", error);
      setError(error?.message || "Si è verificato un errore durante la registrazione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Card - AZIENDA */}
      <div className="mb-6 p-4 bg-gradient-to-r from-jobtv-blue/10 to-jobtv-lightblue/10 rounded-xl border-2 border-jobtv-blue/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-jobtv-blue to-jobtv-lightblue rounded-lg shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-jobtv-blue">Account Azienda</h2>
            <p className="text-sm text-gray-600">Ti stai registrando per CERCARE CANDIDATI</p>
          </div>
        </div>
      </div>

      {/* Badge di tipo account */}
      <div className="mb-6 flex items-center justify-center gap-2 px-4 py-2 bg-jobtv-blue/20 rounded-full border border-jobtv-blue/30">
        <Building className="w-4 h-4 text-jobtv-blue" />
        <span className="text-sm font-semibold text-jobtv-blue">PROFILO AZIENDA</span>
      </div>

      <ErrorDisplay error={error} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Sezione: Dati Azienda */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Building className="w-4 h-4 text-jobtv-blue" />
              <span className="text-sm font-semibold text-gray-700">Dati Azienda</span>
            </div>

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Azienda *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-blue" />
                      <Input
                        placeholder="Es: Mario Rossi S.r.l."
                        className="pl-10 border-jobtv-blue/30 focus:border-jobtv-blue focus:ring-jobtv-blue/20"
                        {...field}
                        autoComplete="organization"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sezione: Contatti */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Mail className="w-4 h-4 text-jobtv-blue" />
              <span className="text-sm font-semibold text-gray-700">Contatti Aziendali</span>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Aziendale *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-blue" />
                      <Input
                        type="email"
                        placeholder="info@tuaazienda.it"
                        className="pl-10 border-jobtv-blue/30 focus:border-jobtv-blue focus:ring-jobtv-blue/20"
                        {...field}
                        autoComplete="email"
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">Usa l'email aziendale per maggiore professionalità</p>
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
                    <FormLabel>Città sede *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-blue" />
                        <Input
                          placeholder="Milano"
                          className="pl-10 border-jobtv-blue/30 focus:border-jobtv-blue focus:ring-jobtv-blue/20"
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
                    <div className="flex items-center gap-1">
                      <FormLabel>Telefono *</FormLabel>
                      <button
                        type="button"
                        onClick={showPhonePopUp}
                        className="text-jobtv-blue hover:text-jobtv-blue/80"
                        title="Informazioni sul telefono"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-blue" />
                        <Input
                          type="tel"
                          placeholder="+39 02..."
                          className="pl-10 border-jobtv-blue/30 focus:border-jobtv-blue focus:ring-jobtv-blue/20"
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

          {/* Sezione: Dati Fiscali */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Building className="w-4 h-4 text-jobtv-teal" />
              <span className="text-sm font-semibold text-gray-700">Dati Fiscali</span>
              {vatLoaded && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Auto-compilato
                </span>
              )}
            </div>

            <FormField
              control={form.control}
              name="vat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partita IVA *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                      <Input
                        placeholder="Es: 12345678901"
                        className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          handleVatBlur(e.target.value);
                        }}
                        disabled={vatLoading}
                        autoComplete="off"
                      />
                      {vatLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal animate-spin" />
                      )}
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">I dati aziendali verranno riempiti automaticamente dalla Camera di Commercio</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sdi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codice SDI</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                      <Input
                        placeholder="Es: W7GKJN1"
                        className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal focus:ring-jobtv-teal/20"
                        {...field}
                        disabled={vatLoading}
                        autoComplete="off"
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">Opzionale - Verrà completato automaticamente se disponibile</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sezione: Password */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Lock className="w-4 h-4 text-jobtv-blue" />
              <span className="text-sm font-semibold text-gray-700">Password Account</span>
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-blue" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Almeno 6 caratteri"
                        className="pl-10 pr-10 border-jobtv-blue/30 focus:border-jobtv-blue focus:ring-jobtv-blue/20"
                        {...field}
                        autoComplete="new-password"
                      />
                      <button

      {/* Pop-up Modale per il Telefono */}
      {popUp.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="mb-4 text-4xl">{popUp.title.split(" ")[0]}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{popUp.title.substring(popUp.title.indexOf(" ") + 1)}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{popUp.message}</p>
              <button
                onClick={() => setPopUp({ show: false, title: "", message: "" })}
                className="bg-gradient-to-r from-jobtv-teal to-jobtv-blue text-white px-8 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Ho capito
              </button>
            </div>
          </div>
        </div>
      )}
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
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-blue" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ripeti la password"
                        className="pl-10 pr-10 border-jobtv-blue/30 focus:border-jobtv-blue focus:ring-jobtv-blue/20"
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

          {/* Submit Button - AZIENDA */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-jobtv-blue to-jobtv-lightblue hover:opacity-90 shadow-lg hover:shadow-xl transition-all h-12 text-base font-semibold"
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
                Crea Account Azienda
              </>
            )}
          </Button>

          {/* Info links */}
          <div className="text-center text-sm space-y-2 pt-2">
            <div className="text-gray-600">
              Hai già un account?{" "}
              <Link to="/login" className="text-jobtv-blue hover:text-jobtv-blue/80 font-medium">
                Accedi
              </Link>
            </div>
            <div>
              <Link to="/register/candidate" className="text-gray-500 hover:text-jobtv-teal">
                Sei un candidato? Registrati come candidato →
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
