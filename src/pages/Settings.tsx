import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PageLayout from "@/components/layout/PageLayout";
import { User, Save, Loader2, ArrowLeft } from "lucide-react";

type UserType = "candidate" | "company" | null;

type CandidateProfile = {
  first_name: string;
  last_name: string;
  city: string;
  phone: string;
};

type CompanyProfile = {
  company_name: string;
  city: string;
  phone: string;
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    first_name: "",
    last_name: "",
    city: "",
    phone: "",
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    company_name: "",
    city: "",
    phone: "",
  });

  const profileTitle = useMemo(() => {
    if (userType === "candidate") return "Dati Profilo Candidato";
    if (userType === "company") return "Dati Profilo Azienda";
    return "Impostazioni Profilo";
  }, [userType]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }
        
        // Fetch common profile data from 'profiles' table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_type, first_name, last_name, company_name, city, phone")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        const typedData = profileData as unknown as {
          user_type?: UserType;
          first_name?: string | null;
          last_name?: string | null;
          city?: string | null;
          phone?: string | null;
        };

        const type = (typedData?.user_type ?? null) as UserType;
        setUserType(type);

        if (type === "candidate") {
          setCandidateProfile({
            first_name: typedData?.first_name ?? "",
            last_name: typedData?.last_name ?? "",
            city: typedData?.city ?? "",
            phone: typedData?.phone ?? "",
          });
          // Also fetch candidate specific data if needed, though current form only uses common fields
          const { data: candidateSpecificData } = await supabase
            .from("candidate_profiles")
            .select("first_name, last_name, city, phone") // Re-fetch to ensure consistency if these fields are duplicated
            .eq("id", user.id)
            .single();
          if (candidateSpecificData) {
            setCandidateProfile({
              first_name: candidateSpecificData.first_name ?? "",
              last_name: candidateSpecificData.last_name ?? "",
              city: candidateSpecificData.city ?? "",
              phone: candidateSpecificData.phone ?? "",
            });
          }
        } else if (type === "company") {
          // Fetch company specific data
          const { data: companySpecificData, error: companySpecificError } = await supabase
            .from("company_profiles")
            .select("company_name, city, phone")
            .eq("id", user.id)
            .single();
          if (companySpecificError) throw companySpecificError;
          if (companySpecificData) {
            setCompanyProfile({
              company_name: companySpecificData.company_name ?? "",
              city: companySpecificData.city ?? "",
              phone: companySpecificData.phone ?? "",
            });
          }
        }
      } catch (error: any) {
        toast.error("Errore nel caricamento del profilo");
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (userType === "candidate") {
        // Update candidate_profiles table
        const { error: candError } = await supabase
          .from("candidate_profiles")
          .update({
            first_name: candidateProfile.first_name.trim(),
            last_name: candidateProfile.last_name.trim(),
            city: candidateProfile.city.trim(),
            phone: candidateProfile.phone.trim(),
          })
          .eq("id", user.id);
        if (candError) throw candError;

        // Update common fields in profiles table if they exist there
        const { error: profError } = await supabase
          .from("profiles")
          .update({
            first_name: candidateProfile.first_name.trim(),
            last_name: candidateProfile.last_name.trim(),
            city: candidateProfile.city.trim(),
            phone: candidateProfile.phone.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        if (profError) throw profError;
      } else if (userType === "company") {
        
        // Update company_profiles table
        const { error: companyError } = await supabase
          .from("company_profiles")
          .update({
            company_name: companyProfile.company_name.trim(),
            city: companyProfile.city.trim(),
            phone: companyProfile.phone.trim(),
          })
          .eq("id", user.id);
        if (companyError) throw companyError;

        // Update common fields in profiles table if they exist there
        const { error: profilesError } = await supabase
          .from("profiles")
          .update({ company_name: companyProfile.company_name.trim(), city: companyProfile.city.trim(), phone: companyProfile.phone.trim(), updated_at: new Date().toISOString() })
          .eq("id", user.id);
        if (profilesError) throw profilesError;
      } else {
        toast.error("Tipo profilo non riconosciuto. Riprova.");
        return;
      }

      toast.success("Profilo aggiornato con successo");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jobtv-blue" />
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna indietro
        </Button>

        <h1 className="text-3xl font-bold mb-8">{profileTitle}</h1>

        <Card className="border-jobtv-blue/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-jobtv-blue" /> Informazioni Profilo
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-5">
              {userType === "candidate" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome</Label>
                    <Input
                      id="first_name"
                      value={candidateProfile.first_name}
                      onChange={(e) =>
                        setCandidateProfile((p) => ({ ...p, first_name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Cognome</Label>
                    <Input
                      id="last_name"
                      value={candidateProfile.last_name}
                      onChange={(e) =>
                        setCandidateProfile((p) => ({ ...p, last_name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Città</Label>
                    <Input
                      id="city"
                      value={candidateProfile.city}
                      onChange={(e) =>
                        setCandidateProfile((p) => ({ ...p, city: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      value={candidateProfile.phone}
                      onChange={(e) =>
                        setCandidateProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>
                </>
              )}

              {userType === "company" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nome Azienda</Label>
                    <Input
                      id="company_name"
                      value={companyProfile.company_name}
                      onChange={(e) =>
                        setCompanyProfile((p) => ({
                          ...p,
                          company_name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city_company">Città</Label>
                    <Input
                      id="city_company"
                      value={companyProfile.city}
                      onChange={(e) =>
                        setCompanyProfile((p) => ({ ...p, city: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_company">Telefono</Label>
                    <Input
                      id="phone_company"
                      value={companyProfile.phone}
                      onChange={(e) =>
                        setCompanyProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>
                </>
              )}

              {userType === null && (
                <div className="text-center py-8 text-gray-500">
                  Tipo profilo non disponibile.
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={updating} className="w-full bg-jobtv-gradient">
                {updating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salva Modifiche
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Settings;
