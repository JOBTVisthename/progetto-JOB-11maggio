import { useState, useEffect, useRef, useCallback } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select components
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Video, StopCircle, Check, X, Loader2, Camera, RefreshCcw } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const interviewFormSchema = z.object({
  title: z.string().min(3, { message: "Il titolo deve contenere almeno 3 caratteri" }),
  description: z.string().optional(),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

export default function RecordInterview() {
16 maggio l  const { user, loading: authLoading, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]); // Added state for video devices
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined); // Added state for selected device

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const candidateQuestions = [
    'Qual è il tuo nome completo?',
    'Qual è il titolo di lavoro che desideri?',
    'Quando sei nato/a?',
    'In quale paese vivi attualmente?',
    'In quale città vivi attualmente?',
    'In quale provincia/stato vivi?',
    'Da quanto tempo stai cercando lavoro?',
    'Qual è la tua preferenza di spostamento?',
    'Sei disposto/a a trasferirti?',
    'Sei disposto/a a cambiare regione?',
    'Qual è la tua data di inizio disponibile più vicina?',
    'Sei disponibile a lavorare nei fine settimana?',
    'Sei disponibile per lavoro a turni?'
  ];

  const companyQuestions = [
    'Presenta brevemente la tua azienda',
    'Che figura state cercando in questo momento?',
    'Quali sono i valori principali del vostro team?',
    'Perché un candidato dovrebbe scegliere voi?',
    'Qual è la sfida principale di questo ruolo?'
  ];

  const questions = userType === 'company' ? companyQuestions : candidateQuestions;
  const QUESTION_DURATION = Math.round(60 / questions.length);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleStopRecording = () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setRecording(false);
    };

    if (recording && timeLeft > 0) {
      if (timeLeft === 60) {
        setCurrentQuestionIndex(0);
      }
      
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setElapsedTime(prev => {
          const newElapsed = prev + 1;
          if (newElapsed > 0 && newElapsed % QUESTION_DURATION === 0) {
            setCurrentQuestionIndex(prevIndex => 
              Math.min(prevIndex + 1, questions.length - 1)
            );
          }
          return newElapsed;
        });
      }, 1000);
    } else if (timeLeft === 0 && recording) {
      handleStopRecording();
    }
    return () => clearInterval(timer);
  }, [recording, timeLeft]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Function to get video devices and request permission
  const requestCameraPermission = useCallback(async (deviceId?: string) => {
    if (isRequestingPermission) return;

    setIsRequestingPermission(true);
    setStreamError(null);

    // Stop existing stream before requesting a new one
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    try {
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      setVideoDevices(videoInputs);

      // Set default device if none selected or selected is invalid
      const currentDeviceId = deviceId || selectedDeviceId;
      const selectedDeviceExists = videoInputs.some(d => d.deviceId === currentDeviceId);
      const finalDeviceId = selectedDeviceExists ? currentDeviceId : (videoInputs.length > 0 ? videoInputs[0].deviceId : undefined);
      
      if (finalDeviceId && !selectedDeviceId) {
        setSelectedDeviceId(finalDeviceId); // Update state if we picked a default
      }

      if (videoInputs.length === 0) {
        setStreamError("Nessuna fotocamera trovata su questo dispositivo.");
        setIsRequestingPermission(false);
        return;
      }

      // Define constraints
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: finalDeviceId ? { deviceId: { exact: finalDeviceId } } : true,
      };

      // Get user media
      const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      // Set the stream state. The useEffect below will handle attaching it.
      setStream(currentStream);
      console.log("Stream obtained, state set."); // Keep only one call
      setStreamError(null); // Clear potential earlier errors if we got this far
    } catch (err: any) {
      console.error("Camera access error:", err);
      let errorMsg = `Errore di accesso: ${err.message || "Impossibile accedere alla fotocamera e al microfono"}`;
      if (err.name === "NotAllowedError") {
        errorMsg = "Permesso negato: per favore concedi l'accesso alla fotocamera e al microfono.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "Nessuna fotocamera/microfono trovato o accessibile.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
         errorMsg = "La fotocamera selezionata è già in uso o non funziona correttamente.";
      } else if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") {
         errorMsg = "La fotocamera selezionata non supporta le impostazioni richieste.";
      }
      setStreamError(errorMsg);
      setVideoDevices([]); // Clear devices list on error
    } finally {
      setIsRequestingPermission(false); // Fix: reset flag
    }
  }, [selectedDeviceId]); // Removed stream and isRequestingPermission to prevent loop
  useEffect(() => {
    if (!previewUrl && !stream && !streamError) {
      requestCameraPermission();
    }
  }, [previewUrl, stream, streamError, requestCameraPermission]); 

  // useEffect to attach the stream to the video element when stream state changes
  // useEffect to attach the stream to the video element when stream state changes
  useEffect(() => {
    const videoElement = videoRef.current; // Capture ref value for cleanup
    if (stream && videoElement) {
      console.log("useEffect[stream]: Attaching stream to video element:", videoElement);
      // Explicitly set srcObject to null first to help reset state
      videoElement.srcObject = null; 
      videoElement.srcObject = stream;
      // Ensure attributes are set (redundant but safe)
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.autoplay = true; // Explicitly set autoplay here too
      
      // Attempt play just in case autoplay doesn't fire reliably
      videoElement.play().catch(error => {
         console.warn("useEffect[stream]: Autoplay might have failed or play() was interrupted:", error);
         // Don't set error state here, just log. Preview might still work via autoplay.
      });

    } else {
      console.log("useEffect[stream]: Stream or videoRef not available for attachment.");
    }
    
    // Cleanup function to remove srcObject when stream changes or component unmounts
    return () => {
      if (videoElement) {
         console.log("useEffect[stream]: Cleaning up srcObject.");
         videoElement.srcObject = null;
      }
    };
  }, [stream]); // Only run when stream changes

  // Handler for when video metadata is loaded - attempt play here
  const handleVideoMetadataLoaded = useCallback(() => {
    if (videoRef.current) {
      console.log("handleVideoMetadataLoaded: Metadata loaded, attempting play.");
      videoRef.current.play().catch(error => {
        console.warn("handleVideoMetadataLoaded: play() failed:", error);
        // Inform user playback might need manual interaction if autoplay fails
        toast({
          title: "Info Anteprima",
          description: `L'anteprima video potrebbe richiedere un click per avviarsi (${error.message}).`,
          variant: "default",
        });
      });
    }
  }, [toast]);

  const startRecording = useCallback(() => {
    if (!stream) {
      requestCameraPermission();
      return;
    }

    setRecording(true);
    setTimeLeft(60);
    setCurrentQuestionIndex(0);
    chunksRef.current = [];
    setVideoBlob(null);
    setPreviewUrl(null);
    setUploadedVideoUrl(null);

    // Check stream and tracks validity before proceeding
    if (!stream || !stream.active || stream.getVideoTracks().length === 0 || stream.getAudioTracks().length === 0 || stream.getVideoTracks()[0].readyState !== 'live' || stream.getAudioTracks()[0].readyState !== 'live') {
      console.error("Stream is not active or missing tracks before starting recording.");
      setStreamError("Errore stream fotocamera/audio. Riprova a selezionare la fotocamera o ricarica.");
      setRecording(false);
      return;
    }
    console.log("Stream and tracks are active. Proceeding with recording.");

    // Create MediaRecorder instance here, just before starting
    let options: MediaRecorderOptions = {};
    const mimeType = 'video/webm'; // Try simple webm first

    if (MediaRecorder.isTypeSupported(mimeType)) {
      options = { mimeType };
      console.log("Using MIME type:", mimeType);
    } else {
      console.log("Using default MIME type (browser default)");
    }

    try {
      console.log("Attempting to create MediaRecorder with options:", options);
      // Ensure previous recorder is stopped if it exists (though should be handled by stopRecording/reset)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
         mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      console.log("MediaRecorder created successfully.");
    } catch (e: any) {
      console.error("Failed to create MediaRecorder:", e);
      setStreamError(`Errore creazione registratore: ${e.message}`);
      setRecording(false); // Stop the recording state
      return; // Exit if recorder cannot be created
    }
    // --- End of MediaRecorder creation ---

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'video/webm' });
      const finalBlob = blob.size > 0 ? blob : null;
      setVideoBlob(finalBlob);
      setPreviewUrl(URL.createObjectURL(blob));
    };

    try {
      mediaRecorderRef.current.start(1000); // Start recording
    } catch (e: any) {
       console.error("Failed to start MediaRecorder:", e);
       setStreamError(`Errore avvio registrazione: ${e.message}. Prova a selezionare un'altra fotocamera o ricarica la pagina.`);
       setRecording(false); // Stop the recording state
       // Optionally stop stream tracks here as well if needed
       // stream.getTracks().forEach(track => track.stop());
       // setStream(null);
    }
  }, [stream, requestCameraPermission]);

  const uploadToSupabase = async (blob: Blob, values: InterviewFormValues) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setUploadProgress(10);
      
      const fileName = `interview_${user.id}_${Date.now()}.webm`;
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('videos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'video/webm',
        });
      
      if (fileError) throw fileError;
      setUploadProgress(70);
      
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;
      setUploadedVideoUrl(publicUrl);
      setUploadProgress(90);
      
      const { data: interviewData, error: interviewError } = await supabase
        .from('video_interviews')
        .insert({
          candidate_id: user.id,
          title: values.title,
          description: values.description || '',
          video_url: publicUrl,
          duration: 60,
        })
        .select()
        .single();
      
      if (interviewError) throw interviewError;
      setUploadProgress(100);
      
      return interviewData;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Errore di caricamento",
        description: error.message || "Impossibile caricare il video",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: InterviewFormValues) => {
    if (!videoBlob || !user) {
      toast({
        title: "Errore",
        description: "Nessun video registrato o utente non autenticato",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await uploadToSupabase(videoBlob, values);
      
      if (result) {
        toast({
          title: "Video caricato con successo",
          description: "La tua intervista video è stata salvata",
        });
        navigate("/video-interview");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il salvataggio",
        variant: "destructive",
      });
    }
  };

  const resetRecording = async () => {
    setVideoBlob(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadedVideoUrl(null);
    form.reset();
    
    await requestCameraPermission();
  };

  if (authLoading) {
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
            <p className="mb-6">Devi essere autenticato per registrare un'intervista video.</p>
            <Button onClick={() => navigate("/login")}>Accedi</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-8">Registra la tua Intervista Video</h1>
          
          <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
            {previewUrl ? (
              <>
                <video
                  key={previewUrl}
                  src={previewUrl}
                  controls
                  className="w-full h-full object-cover"
                  onError={() => setStreamError("Failed to load video preview")}
                />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white">Caricamento in corso...</div>
                  </div>
                )}
              </>
            ) : (
              <>
                {streamError ? (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <Camera className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-center text-gray-700 mb-4">{streamError}</p>
                    <Button 
                      onClick={() => requestCameraPermission()} // Wrapped in anonymous function
                      disabled={isRequestingPermission}
                      className="bg-jobtv-gradient"
                    >
                      {isRequestingPermission ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Richiesta in corso...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Riprova accesso fotocamera
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay // Keep autoplay as a primary attempt
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      onLoadedMetadata={handleVideoMetadataLoaded} // Add event handler
                    />
                    {recording && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                        {timeLeft}s
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Camera Selection Dropdown */}
          {!recording && !previewUrl && videoDevices.length > 1 && (
            <div className="mb-4">
              <Select
                value={selectedDeviceId}
                onValueChange={(value) => {
                  setSelectedDeviceId(value);
                  requestCameraPermission(value); // Request permission with the new device
                }}
                disabled={isRequestingPermission || !!streamError}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona una fotocamera" />
                </SelectTrigger>
                <SelectContent>
                  {videoDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Fotocamera ${videoDevices.indexOf(device) + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {streamError && !previewUrl && (
            <Alert className="mb-6">
              <AlertTitle>Richiesta permessi fotocamera</AlertTitle>
              <AlertDescription>
                <p>Per registrare il video, devi consentire l'accesso alla fotocamera e al microfono nel browser.</p>
                <p className="mt-2">Se hai bloccato i permessi, puoi ripristinarli nelle impostazioni del browser:</p>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Chrome: Impostazioni &gt; Privacy e sicurezza &gt; Impostazioni sito &gt; Fotocamera/Microfono</li>
                  <li>Firefox: Preferenze &gt; Privacy e sicurezza &gt; Permessi &gt; Fotocamera/Microfono</li>
                  <li>Safari: Preferenze &gt; Siti web &gt; Fotocamera/Microfono</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {recording && (
            <div className="mb-6 space-y-4">
              <Progress value={((60 - timeLeft) / 60) * 100} className="w-full h-2" />
              
              <div className="text-center h-24 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl font-bold text-jobtv-blue"
                  >
                    {questions[currentQuestionIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {!previewUrl ? (
            <div className="flex justify-center my-6">
              {recording ? (
                <Button 
                  onClick={stopRecording}
                  disabled={!!streamError || !stream}
                  variant="destructive"
                  className="px-6 py-3"
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Interrompi Registrazione
                </Button>
              ) : (
                <Button 
                  onClick={startRecording}
                  disabled={!!streamError || !stream || isRequestingPermission}
                  className="px-6 py-3 bg-jobtv-gradient"
                >
                  {isRequestingPermission ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparazione fotocamera...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Inizia Registrazione (60s)
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titolo dell'intervista</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="es. Mi presento: la mia esperienza lavorativa" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrizione (opzionale)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Aggiungi una breve descrizione della tua intervista..." 
                            className="min-h-[100px]" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Caricamento in corso...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <Button 
                      type="button" 
                      onClick={resetRecording}
                      variant="outline"
                    >
                      <X className="mr-2 h-4 w-4" /> Registra di nuovo
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading}
                      className="bg-jobtv-gradient"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvataggio...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Pubblica Video
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p>
              Registra un breve video di te stesso che risponde alle domande visualizzate. Questo aiuterà le aziende a conoscerti meglio prima di un potenziale colloquio.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
