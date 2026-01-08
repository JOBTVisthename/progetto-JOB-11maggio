
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const videoInterviewSchema = z.object({
  title: z.string().min(3, { message: "Il titolo deve contenere almeno 3 caratteri" }),
  description: z.string().optional(),
  video_url: z.string().url({ message: "Inserisci un URL valido per il video" }).optional().or(z.literal("")),
});

type VideoInterviewFormValues = z.infer<typeof videoInterviewSchema>;

interface VideoInterviewFormProps {
  userId: string;
  onSuccess: (interview: any) => void;
  onCancel: () => void;
  initialData?: VideoInterviewFormValues & { id: string };
}

export default function VideoInterviewForm({ userId, onSuccess, onCancel, initialData }: VideoInterviewFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<VideoInterviewFormValues>({
    resolver: zodResolver(videoInterviewSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      video_url: "",
    },
  });

  const onSubmit = async (values: VideoInterviewFormValues) => {
    setLoading(true);
    
    try {
      if (!values.title) {
        throw new Error("Il titolo è obbligatorio");
      }
      
      const interviewData = {
        ...values,
        candidate_id: userId,
        title: values.title,
        description: values.description || null,
        video_url: values.video_url || null
      };
      
      let response;
      
      if (initialData?.id) {
        response = await supabase
          .from("video_interviews")
          .update(interviewData)
          .eq("id", initialData.id)
          .select()
          .single();
      } else {
        response = await supabase
          .from("video_interviews")
          .insert(interviewData)
          .select()
          .single();
      }
      
      if (response.error) {
        console.error("Supabase error:", response.error);
        throw response.error;
      }
      
      onSuccess(response.data);
    } catch (error: any) {
      console.error("Error saving video interview:", error);
      toast({
        title: "Errore",
        description: error.message || error.error_description || "Si è verificato un errore durante il salvataggio dell'intervista",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo dell'intervista</FormLabel>
              <FormControl>
                <Input placeholder="es. Intervista per posizione sviluppatore web" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione (opzionale)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Breve descrizione del contenuto dell'intervista..." 
                  className="min-h-[120px]" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del video (opzionale)</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://www.youtube.com/watch?v=example" 
                    {...field} 
                    value={field.value || ""}
                  />
                </div>
              </FormControl>
              <p className="text-sm text-gray-500 mt-1">
                Incolla l'URL del tuo video da YouTube, Vimeo o altra piattaforma
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" className="bg-jobtv-gradient" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                {initialData?.id ? "Aggiorna" : "Salva"} Intervista
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
