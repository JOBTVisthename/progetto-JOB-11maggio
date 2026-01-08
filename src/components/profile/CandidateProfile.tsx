
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
import candidateProfileSchema, { CandidateProfileFormValues } from "./candidate/CandidateProfileSchema";
import PersonalInfoSection from "./candidate/PersonalInfoSection";
import JobPreferencesSection from "./candidate/JobPreferencesSection";
import AvailabilitySection from "./candidate/AvailabilitySection";
import NotesSection from "./candidate/NotesSection";
import CurriculumSection from "./candidate/CurriculumSection";

interface CandidateProfileProps {
  profileData: any;
  userId: string;
}

export default function CandidateProfile({ profileData, userId }: CandidateProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const defaultValues: Partial<CandidateProfileFormValues> = {
    first_name: profileData?.first_name || "",
    last_name: profileData?.last_name || "",
    birth_date: profileData?.birth_date || "",
    country: profileData?.country || "",
    city: profileData?.city || "",
    province: profileData?.province || "",
    desired_job_title: profileData?.desired_job_title || "",
    job_search_duration: profileData?.job_search_duration || "",
    travel_preference: profileData?.travel_preference || "",
    willing_to_relocate: profileData?.willing_to_relocate || false,
    willing_to_change_region: profileData?.willing_to_change_region || false,
    available_start_date: profileData?.available_start_date || "",
    weekend_availability: profileData?.weekend_availability || false,
    shift_work_availability: profileData?.shift_work_availability || false,
    profile_image_url: profileData?.profile_image_url || "",
    notes: profileData?.notes || "",
    cv_url: profileData?.cv_url || "",
  };
  
  const form = useForm<CandidateProfileFormValues>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues
  });
  
  const onSubmit = async (data: CandidateProfileFormValues) => {
    setIsLoading(true);
    
    try {
      // Process the data to handle empty date fields
      const processedData = {
        ...data,
        // Convert empty dates to null to avoid PostgreSQL date format errors
        birth_date: data.birth_date?.trim() ? data.birth_date : null,
        available_start_date: data.available_start_date?.trim() ? data.available_start_date : null
      };
      
      console.log("Submitting profile data:", processedData);
      
      const { error } = await supabase
        .from("candidate_profiles")
        .update(processedData)
        .eq("id", userId);
        
      if (error) throw error;
      
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Errore di aggiornamento",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del profilo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploaded = async (url: string) => {
    try {
      const { error } = await supabase
        .from("candidate_profiles")
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

  const handleCvUploaded = async (url: string) => {
    try {
      const { error } = await supabase
        .from("candidate_profiles")
        .update({ cv_url: url })
        .eq("id", userId);
      
      if (error) throw error;
      
      // Aggiorna il campo del form
      form.setValue("cv_url", url);
    } catch (error) {
      console.error("Error updating CV URL:", error);
      throw error;
    }
  };

  const fullName = `${form.watch("first_name")} ${form.watch("last_name")}`.trim() || "Candidato";
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Profilo Candidato</CardTitle>
            <CardDescription>
              Aggiorna il tuo profilo professionale per migliorare le tue possibilità di essere contattato.
            </CardDescription>
          </div>
          <ProfileImageUpload
            userId={userId}
            existingImageUrl={form.watch("profile_image_url")}
            fullName={fullName}
            onImageUploaded={handleImageUploaded}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PersonalInfoSection form={form} />
            
            <JobPreferencesSection form={form} />
            
            <CurriculumSection 
              userId={userId}
              cvUrl={form.watch("cv_url")}
              onCvUploaded={handleCvUploaded}
            />
            
            <NotesSection form={form} />
            
            <AvailabilitySection form={form} />
            
            <Button type="submit" className="w-full bg-jobtv-gradient" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva profilo"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
