
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getInitials } from "@/components/matches/utils/matchUtils";

interface ProfileImageUploadProps {
  userId: string;
  existingImageUrl: string | null | undefined;
  fullName: string;
  onImageUploaded: (url: string) => Promise<void>;
  className?: string;
}

export default function ProfileImageUpload({
  userId,
  existingImageUrl,
  fullName,
  onImageUploaded,
  className = "h-24 w-24"
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Seleziona un'immagine da caricare");
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      // Otteniamo l'URL pubblico dell'immagine
      const { data } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
        
      await onImageUploaded(data.publicUrl);
      
      toast({
        title: "Immagine caricata",
        description: "L'immagine del profilo è stata aggiornata",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Errore di caricamento",
        description: error.message || "Si è verificato un errore durante il caricamento dell'immagine",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    try {
      if (!existingImageUrl) return;
      
      setDeleting(true);
      
      // Estraiamo il nome del file dall'URL
      const filePathMatch = existingImageUrl.match(/profile_images\/([^?]+)/);
      if (!filePathMatch || !filePathMatch[1]) throw new Error("Impossibile estrarre il percorso del file");
      
      const filePath = filePathMatch[1];
      
      const { error: deleteError } = await supabase.storage
        .from('profile_images')
        .remove([filePath]);
        
      if (deleteError) throw deleteError;
      
      await onImageUploaded("");
      
      toast({
        title: "Immagine eliminata",
        description: "L'immagine del profilo è stata rimossa",
      });
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast({
        title: "Errore di eliminazione",
        description: error.message || "Si è verificato un errore durante l'eliminazione dell'immagine",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className={className}>
        <AvatarImage 
          src={existingImageUrl || ""} 
          alt={fullName}
        />
        <AvatarFallback className="text-2xl">
          {getInitials(fullName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
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
              Carica
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
              />
            </>
          )}
        </Button>
        
        {existingImageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={deleteImage}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash className="h-4 w-4 mr-1" />
                Rimuovi
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
