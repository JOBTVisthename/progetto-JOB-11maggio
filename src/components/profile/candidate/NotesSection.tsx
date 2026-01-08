
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

const notesSchema = z.object({
  notes: z.string().optional(),
});

type NotesFormValues = z.infer<typeof notesSchema>;

interface NotesSectionProps {
  form: UseFormReturn<any>;
}

export default function NotesSection({ form }: NotesSectionProps) {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Note aggiuntive</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Inserisci qui qualsiasi informazione aggiuntiva che ritieni utile per la tua candidatura..."
              className="min-h-[120px]"
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Usa questo spazio per aggiungere qualsiasi informazione che non trova spazio negli altri campi.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { notesSchema };
