
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CompanyFormValues } from "./CompanyProfileSchema";

interface DescriptionSectionProps {
  form: UseFormReturn<CompanyFormValues>;
}

export default function DescriptionSection({ form }: DescriptionSectionProps) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrizione Azienda</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Descrivi brevemente la tua azienda, la sua missione e cultura..." 
              className="min-h-[120px]" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
