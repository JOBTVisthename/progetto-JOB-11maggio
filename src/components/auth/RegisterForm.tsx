import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import ErrorDisplay from "./ui/ErrorDisplay";
import { Check, Loader2, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";

const registerSchema = z.object({
  userType: z.enum(["candidate", "company"], {
    required_error: "Seleziona il tipo di account"
  }),
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  confirmPassword: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  city: z.string().min(1, "La città è obbligatoria"),
  phone: z.string().min(1, "Il telefono è obbligatorio"),
})
  .refine(data => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  })
  .refine(data => {
    if (data.userType === "candidate") {
      return data.firstName && data.firstName.trim() !== "" &&
             data.lastName && data.lastName.trim() !== "";
    }
    return data.companyName && data.companyName.trim() !== "";
  }, {
    message: "Compila tutti i campi obbligatori",
    path: ["firstName"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "candidate",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      companyName: "",
      city: "",
      phone: "",
    },
  });

  const userType = form.watch("userType");

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const metadata: any = {
        city: values.city,
        phone: values.phone,
      };

      if (values.userType === "candidate") {
        metadata.first_name = values.firstName;
        metadata.last_name = values.lastName;
      } else {
        metadata.company_name = values.companyName;
      }

      await signUp(values.email, values.password, values.userType, metadata);

      // Redirect based on user type
      if (values.userType === "company") {
        navigate("/company/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error?.message || "Si è verificato un errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-jobtv-gradient mb-2">
          Crea un account
        </h2>
        <p className="text-gray-500">Compila il form per registrarti</p>
      </div>

      <ErrorDisplay error={error} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* User Type Selector */}
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo di account *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${field.value === 'candidate' ? 'border-jobtv-blue bg-jobtv-blue/5' : 'border-gray-200 hover:border-jobtv-teal'}`}>
                      <RadioGroupItem value="candidate" id="candidate" />
                      <User className={`h-6 w-6 ${field.value === 'candidate' ? 'text-jobtv-blue' : 'text-gray-400'}`} />
                      <div>
                        <FormLabel htmlFor="candidate" className="cursor-pointer font-medium">
                          Candidato
                        </FormLabel>
                        <p className="text-xs text-gray-500">Cerco lavoro</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${field.value === 'company' ? 'border-jobtv-blue bg-jobtv-blue/5' : 'border-gray-200 hover:border-jobtv-teal'}`}>
                      <RadioGroupItem value="company" id="company" />
                      <Building2 className={`h-6 w-6 ${field.value === 'company' ? 'text-jobtv-blue' : 'text-gray-400'}`} />
                      <div>
                        <FormLabel htmlFor="company" className="cursor-pointer font-medium">
                          Azienda
                        </FormLabel>
                        <p className="text-xs text-gray-500">Cerco candidati</p>
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Candidate Fields */}
          {userType === "candidate" && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mario" {...field} />
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
                      <Input placeholder="Rossi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Company Fields */}
          {userType === "company" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Azienda *</FormLabel>
                    <FormControl>
                      <Input placeholder="La tua azienda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@esempio.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città *</FormLabel>
                  <FormControl>
                    <Input placeholder="Milano" {...field} />
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
                    <Input placeholder="+39 333 1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Almeno 6 caratteri" {...field} />
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
                  <Input type="password" placeholder="Ripeti la password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-jobtv-gradient shadow-lg hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {loading ? "Registrazione..." : "Registrati"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Hai già un account?{" "}
            <Link to="/login" className="text-jobtv-blue hover:text-jobtv-teal font-medium">
              Accedi
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
