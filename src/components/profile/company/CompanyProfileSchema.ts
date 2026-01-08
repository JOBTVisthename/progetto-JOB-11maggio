
import { z } from "zod";

export const companyFormSchema = z.object({
  company_name: z.string().min(1, "Il nome dell'azienda è richiesto"),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Inserisci un URL valido").optional().or(z.literal("")),
  profile_image_url: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
