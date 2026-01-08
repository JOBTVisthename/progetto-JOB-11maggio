
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import ProfileImageUpload from "./ProfileImageUpload";
import BasicInfoSection from "./company/BasicInfoSection";
import CompanyDetailsSection from "./company/CompanyDetailsSection";
import DescriptionSection from "./company/DescriptionSection";
import { companyFormSchema, CompanyFormValues } from "./company/CompanyProfileSchema";

interface CompanyProfileProps {
  profileData: any;
  userId: string;
}

export default function CompanyProfile({ profileData, userId }: CompanyProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const defaultValues: Partial<CompanyFormValues> = {
    company_name: profileData?.company_name || "",
    industry: profileData?.industry || "",
    company_size: profileData?.company_size || "",
    description: profileData?.description || "",
    website: profileData?.website || "",
    profile_image_url: profileData?.profile_image_url || "",
  };
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues
  });
  
  const onSubmit = async (data: CompanyFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("company_profiles")
        .update(data)
        .eq("id", userId);
        
      if (error) throw error;
      
      toast({
        title: "Profilo aggiornato",
        description: "Le informazioni dell'azienda sono state salvate con successo",
      });
    } catch (error: any) {
      console.error("Error updating company profile:", error);
      toast({
        title: "Errore di aggiornamento",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del profilo aziendale",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploaded = async (url: string) => {
    try {
      const { error } = await supabase
        .from("company_profiles")
        .update({ profile_image_url: url })
        .eq("id", userId);
      
      if (error) throw error;
      
      // Aggiorna il campo del form
      form.setValue("profile_image_url", url);
    } catch (error) {
      console.error("Error updating profile image URL:", error);
      throw error;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Profilo Aziendale</CardTitle>
            <CardDescription>
              Gestisci le informazioni della tua azienda e cerca candidati
            </CardDescription>
          </div>
          <ProfileImageUpload
            userId={userId}
            existingImageUrl={form.watch("profile_image_url")}
            fullName={form.watch("company_name") || "Azienda"}
            onImageUploaded={handleImageUploaded}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoSection form={form} />
            <CompanyDetailsSection form={form} />
            <DescriptionSection form={form} />
            
            <Button type="submit" className="w-full bg-jobtv-gradient" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva profilo aziendale"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
