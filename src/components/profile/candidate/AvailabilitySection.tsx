
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

const availabilitySchema = z.object({
  willing_to_relocate: z.boolean().optional(),
  willing_to_change_region: z.boolean().optional(),
  weekend_availability: z.boolean().optional(),
  shift_work_availability: z.boolean().optional(),
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

interface AvailabilitySectionProps {
  form: UseFormReturn<any>;
}

export default function AvailabilitySection({ form }: AvailabilitySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="willing_to_relocate"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Disponibile a trasferirsi</FormLabel>
              <FormDescription>
                Sei disposto a trasferirti per lavoro
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="willing_to_change_region"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Disponibile a cambiare regione</FormLabel>
              <FormDescription>
                Sei disposto a cambiare regione per lavoro
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="weekend_availability"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Disponibile nei fine settimana</FormLabel>
              <FormDescription>
                Sei disposto a lavorare nei weekend
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="shift_work_availability"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Disponibile per turni</FormLabel>
              <FormDescription>
                Sei disposto a lavorare su turni
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

export { availabilitySchema };
