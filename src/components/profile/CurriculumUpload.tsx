
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Trash, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CurriculumUploadProps {
  userId: string;
  existingFileUrl: string | null | undefined;
  onFileUploaded: (url: string) => Promise<void>;
}

export default function CurriculumUpload({
  userId,
  existingFileUrl,
  onFileUploaded
}: CurriculumUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  
  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Seleziona un file PDF da caricare");
      }
      
      const file = event.target.files[0];
      
      // Verifica che sia un PDF
      if (file.type !== 'application/pdf') {
        throw new Error("Solo i file PDF sono supportati");
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('curriculum_files')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      // Otteniamo l'URL pubblico del file
      const { data } = supabase.storage
        .from('curriculum_files')
        .getPublicUrl(filePath);
        
      await onFileUploaded(data.publicUrl);
      
      toast({
        title: "Curriculum caricato",
        description: "Il tuo CV è stato aggiornato",
      });
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      toast({
        title: "Errore di caricamento",
        description: error.message || "Si è verificato un errore durante il caricamento del file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async () => {
    try {
      if (!existingFileUrl) return;
      
      setDeleting(true);
      
      // Estraiamo il nome del file dall'URL
      const filePathMatch = existingFileUrl.match(/curriculum_files\/([^?]+)/);
      if (!filePathMatch || !filePathMatch[1]) throw new Error("Impossibile estrarre il percorso del file");
      
      const filePath = filePathMatch[1];
      
      const { error: deleteError } = await supabase.storage
        .from('curriculum_files')
        .remove([filePath]);
        
      if (deleteError) throw deleteError;
      
      await onFileUploaded("");
      
      toast({
        title: "Curriculum eliminato",
        description: "Il tuo CV è stato rimosso",
      });
    } catch (error: any) {
      console.error("Error deleting CV:", error);
      toast({
        title: "Errore di eliminazione",
        description: error.message || "Si è verificato un errore durante l'eliminazione del file",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const viewFile = () => {
    if (existingFileUrl) {
      window.open(existingFileUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col md:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="relative overflow-hidden"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Carica CV
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf"
                onChange={uploadFile}
                disabled={uploading}
              />
            </>
          )}
        </Button>
        
        {existingFileUrl && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={viewFile}
            >
              <FileText className="h-4 w-4 mr-1" />
              Visualizza CV
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={deleteFile}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-1" />
                  Rimuovi CV
                </>
              )}
            </Button>
          </>
        )}
      </div>
      
      {existingFileUrl && (
        <p className="text-sm text-muted-foreground">
          Il tuo curriculum è stato caricato. Puoi visualizzarlo o sostituirlo.
        </p>
      )}
    </div>
  );
}
