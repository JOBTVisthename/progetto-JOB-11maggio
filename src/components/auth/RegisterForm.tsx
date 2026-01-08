import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import ErrorDisplay from "./ui/ErrorDisplay";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Check, Loader2, User, Building, ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  RegisterFormValues,
  registerSchema,
  EmailPasswordFields,
  UserTypeSelector,
  CompanyNameField,
  PersonalInfoFields,
  TermsCheckbox
} from "./forms/RegisterFormFields";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      userType: "candidate",
      companyName: "",
      firstName: "",
      lastName: "",
      acceptTerms: false,
    },
    mode: "onChange"
  });

  const userType = form.watch("userType");
  const maxSteps = userType === "candidate" ? 3 : 2;

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ['email', 'password', 'confirmPassword', 'userType'];
    } else if (step === 2) {
      if (userType === 'candidate') {
        fieldsToValidate = ['firstName', 'lastName'];
      } else {
        // Company finishes at step 2
        return;
      }
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError("Per favore carica solo file PDF");
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      if (userType === 'candidate' && !cvFile) {
        throw new Error("Il CV è obbligatorio");
      }

      const metadata: any = {
        first_name: values.firstName,
        last_name: values.lastName,
      };

      if (values.userType === "company" && values.companyName?.trim() !== "") {
        metadata.company_name = values.companyName?.trim();
      }

      console.log("Preparing signup with:", {
        email: values.email,
        userType: values.userType,
        metadata
      });

      const signUpResult: any = await signUp(
        values.email,
        values.password,
        values.userType as 'candidate' | 'company',
        metadata
      );

      // Handle CV Upload if candidate and user is created
      // NOTE: With email confirmation enabled, the user won't have an active session
      // until they confirm their email. The CV upload will be handled after email
      // confirmation when the user is redirected to the email confirmation page.
      // For now, we redirect to the email confirmation page.

      if (userType === 'candidate' && cvFile) {
        // Store CV file info in sessionStorage to upload after email confirmation
        sessionStorage.setItem('pendingCVUpload', 'true');
        sessionStorage.setItem('cvFileName', cvFile.name);
      }

      navigate("/email-confirmation");
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
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-jobtv-gradient mb-2">Crea un account</h2>
        <p className="text-gray-500">
          Step {step} di {maxSteps}: {
            step === 1 ? "Credenziali" :
              step === 2 ? "Profilo" : "Curriculum"
          }
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-jobtv-gradient transition-all duration-500 ease-out"
            style={{ width: `${(step / maxSteps) * 100}%` }}
          />
        </div>
      </div>

      <ErrorDisplay error={error} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <EmailPasswordFields control={form.control} />
              <UserTypeSelector control={form.control} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {userType === 'candidate' ? (
                <PersonalInfoFields control={form.control} />
              ) : (
                <>
                  <CompanyNameField control={form.control} />
                  <TermsCheckbox control={form.control} />
                </>
              )}
            </div>
          )}

          {step === 3 && userType === 'candidate' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-jobtv-teal transition-colors bg-gray-50/50">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white rounded-full shadow-sm">
                    {cvFile ? <FileText className="h-8 w-8 text-jobtv-teal" /> : <Upload className="h-8 w-8 text-gray-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {cvFile ? cvFile.name : "Carica il tuo CV (Obbligatorio)"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {cvFile ? `${(cvFile.size / 1024 / 1024).toFixed(2)} MB` : "Trascina o clicca per caricare (PDF)"}
                    </p>
                  </div>

                  <div className="relative">
                    <Button type="button" variant="outline" className="relative z-10 w-full">
                      {cvFile ? "Cambia file" : "Seleziona file"}
                    </Button>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                  </div>
                </div>
              </div>
              <TermsCheckbox control={form.control} />
            </div>
          )}

          <div className="flex justify-between pt-4 gap-4">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="w-1/3">
                <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
              </Button>
            )}

            {step < maxSteps ? (
              <Button type="button" onClick={handleNext} className="w-full bg-jobtv-gradient ml-auto">
                Continua <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="w-full bg-jobtv-gradient shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                {loading ? "Registrazione..." : "Completa Registrazione"}
              </Button>
            )}
          </div>

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
