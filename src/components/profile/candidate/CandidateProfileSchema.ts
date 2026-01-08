
import { z } from "zod";
import { personalInfoSchema } from "./PersonalInfoSection";
import { jobPreferencesSchema } from "./JobPreferencesSection";
import { availabilitySchema } from "./AvailabilitySection";
import { notesSchema } from "./NotesSection";
import { curriculumSchema } from "./CurriculumSection";

// Combine all the section schemas into one complete schema
const candidateProfileSchema = personalInfoSchema.merge(jobPreferencesSchema).merge(availabilitySchema).merge(notesSchema).merge(curriculumSchema).merge(
  z.object({
    profile_image_url: z.string().optional(),
  })
);

export type CandidateProfileFormValues = z.infer<typeof candidateProfileSchema>;

export default candidateProfileSchema;
