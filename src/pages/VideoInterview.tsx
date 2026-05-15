
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Video, Upload } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { useToast } from "@/hooks/use-toast";
import VideoInterviewForm from "@/components/video/VideoInterviewForm";
import VideoInterviewList from "@/components/video/VideoInterviewList";

export default function VideoInterview() {
  const { user, loading: authLoading } = useAuth();
  const [videoInterviews, setVideoInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch video interviews
  useEffect(() => {
    const fetchVideoInterviews = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("video_interviews")
          .select("*")
          .eq("candidate_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setVideoInterviews(data || []);
      } catch (error: any) {
        console.error("Error fetching video interviews:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare le interviste video",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchVideoInterviews();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, toast]);

  const handleCreateSuccess = (newInterview: any) => {
    setVideoInterviews([newInterview, ...videoInterviews]);
    setShowForm(false);
    toast({
      title: "Intervista creata",
      description: "La tua video intervista è stata salvata con successo",
    });
  };

 const handleDeleteInterview = (id: string) => {
    setVideoInterviews(videoInterviews.filter(interview => interview.id !== id));
    toast({
      title: "Intervista eliminata",
      description: "Intervista eliminata correttamente.",
    });
  };

  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-jobtv-blue" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accesso Richiesto</h1>
            <p className="mb-6">Devi essere autenticato per visualizzare questa pagina.</p>
            <Button onClick={() => navigate("/login")}>Accedi</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Le tue Video Interviste</h1>
            <div className="flex gap-2">
              <Button 
                className="bg-jobtv-gradient" 
                onClick={() => navigate("/record-interview")}
              >
                <Video className="h-4 w-4 mr-2" /> Registra Intervista
              </Button>
              <Button 
                className="bg-jobtv-gradient" 
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Annulla" : <><Plus className="h-4 w-4 mr-2" /> Carica Video</>}
              </Button>
            </div>
          </div>
          
          {showForm && (
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Carica un'intervista video esistente</h2>
              <VideoInterviewForm 
                userId={user.id} 
                onSuccess={handleCreateSuccess} 
                onCancel={() => setShowForm(false)} 
              />
            </div>
          )}
          
          {!loading && videoInterviews.length === 0 && !showForm && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessuna video intervista</h3>
              <p className="text-gray-500 mb-4">Crea la tua prima video intervista per farti notare dalle aziende</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  className="bg-jobtv-gradient" 
                  onClick={() => navigate("/record-interview")}
                >
                  <Video className="h-4 w-4 mr-2" /> Registra Intervista
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowForm(true)}
                >
                  <Upload className="h-4 w-4 mr-2" /> Carica Video Esistente
                </Button>
              </div>
            </div>
          )}
          
          {videoInterviews.length > 0 && (
            <VideoInterviewList 
              interviews={videoInterviews} 
              onInterviewDelete={handleDeleteInterview} 
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
