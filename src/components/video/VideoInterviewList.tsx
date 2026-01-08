import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2, Video, ExternalLink, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface VideoInterviewListProps {
  interviews: any[];
  onInterviewDelete: (id: string) => void;
}

export default function VideoInterviewList({ interviews, onInterviewDelete }: VideoInterviewListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("video_interviews")
        .delete()
        .eq("id", String(deleteId));
      
      if (error) {
        console.error("Supabase deletion error:", error);
        console.error("Supabase deletion error details:", error.details);
        console.error("Supabase deletion error hint:", error.hint);
        throw error;
      }
      
      onInterviewDelete(deleteId);
      toast({
        title: "Intervista eliminata",
        description: "La video intervista è stata eliminata con successo",
      });
    } catch (error: any) {
      console.error("Error deleting interview:", error);
      console.error("Error deleting interview details:", error.details);
      console.error("Error deleting interview hint:", error.hint);
      let errorMessage = "Impossibile eliminare l'intervista: ";
      if (error.code === '401') {
        errorMessage += "Non sei autorizzato a eliminare questa intervista.";
      } else if (error.code === '403') {
        errorMessage += "Permessi insufficienti per eliminare questa intervista.";
      } else {
        errorMessage += (error.message || error.error_description || "Errore sconosciuto");
      }
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const getVideoThumbnail = (url: string) => {
    if (!url) return null;
    
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be") 
        ? url.split("/").pop() 
        : new URLSearchParams(new URL(url).search).get("v");
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <Card key={interview.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-4">
              {interview.video_url ? (
                <div className="relative w-full pt-[56.25%]">
                  {getVideoThumbnail(interview.video_url) ? (
                    <img 
                      src={getVideoThumbnail(interview.video_url)} 
                      alt={interview.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Video className="h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Nessun video caricato</p>
                </div>
              )}
            </div>
            
            <div className="md:w-2/3">
              <CardHeader>
                <CardTitle>{interview.title}</CardTitle>
                <CardDescription>
                  Creata {formatDistanceToNow(new Date(interview.created_at), { addSuffix: true, locale: it })}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600">
                  {interview.description || "Nessuna descrizione disponibile"}
                </p>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {interview.video_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={interview.video_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visualizza Video
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <Video className="h-4 w-4 mr-2" />
                    Nessun Video
                  </Button>
                )}
                
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteId(interview.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
      
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questa video intervista? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Annulla
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
