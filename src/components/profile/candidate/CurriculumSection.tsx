
import { z } from "zod";
import CurriculumUpload from "../CurriculumUpload";

const curriculumSchema = z.object({
  cv_url: z.string().optional(),
});

type CurriculumFormValues = z.infer<typeof curriculumSchema>;

interface CurriculumSectionProps {
  userId: string;
  cvUrl: string | null | undefined;
  onCvUploaded: (url: string) => Promise<void>;
}

export default function CurriculumSection({ userId, cvUrl, onCvUploaded }: CurriculumSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Curriculum Vitae</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Carica il tuo CV in formato PDF per permettere alle aziende di visionare le tue competenze e le tue esperienze.
      </p>
      <CurriculumUpload 
        userId={userId}
        existingFileUrl={cvUrl}
        onFileUploaded={onCvUploaded}
      />
    </div>
  );
}

export { curriculumSchema };
