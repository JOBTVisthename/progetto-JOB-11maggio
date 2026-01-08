
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

const jobPreferencesSchema = z.object({
  desired_job_title: z.string().optional(),
  job_search_duration: z.string().optional(),
  travel_preference: z.string().optional(),
  available_start_date: z.string().optional(),
});

type JobPreferencesFormValues = z.infer<typeof jobPreferencesSchema>;

interface JobPreferencesSectionProps {
  form: UseFormReturn<any>;
}

export default function JobPreferencesSection({ form }: JobPreferencesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="desired_job_title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titolo di lavoro desiderato</FormLabel>
            <FormControl>
              <Input placeholder="es. Sviluppatore Web" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="job_search_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Da quanto tempo cerchi lavoro</FormLabel>
            <FormControl>
              <Input placeholder="es. 3 mesi" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="travel_preference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferenza di spostamento</FormLabel>
            <FormControl>
              <Input placeholder="es. Massimo 30km" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="available_start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data di disponibilità</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export { jobPreferencesSchema };
