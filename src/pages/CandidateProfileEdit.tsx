import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Camera,
  X,
  Loader2,
  Upload,
  FileText,
  Video,
  CheckCircle,
  MapPin,
  Phone as PhoneIcon,
  Briefcase,
  Calendar,
  Save,
  Trash2,
  Mic,
  MicOff,
  RotateCcw,
  Play,
  Square,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type CandidateProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  phone: string | null;
  desired_job_title: string | null;
  birth_date: string | null;
  available_start_date: string | null;
  willing_to_relocate: boolean | null;
  willing_to_change_region: boolean | null;
  remote_availability: boolean | null;
  shift_work_availability: boolean | null;
  weekend_availability: boolean | null;
  profile_image_url: string | null;
  cv_url: string | null;
  notes: string | null;
  years_of_experience: number | null;
  contract_type_preference: string | null;
  education_level: string | null;
  skills: string[] | null;
  languages: string[] | null;
  salary_expectation_min: number | null;
  salary_expectation_max: number | null;
  job_search_duration: string | null;
};

type VideoInterview = {
  id: string;
  title: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
};

export default function CandidateProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [videoInterviews, setVideoInterviews] = useState<VideoInterview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedTime, setRecordedTime] = useState(0);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("Italia");
  const [phone, setPhone] = useState("");
  const [desiredJobTitle, setDesiredJobTitle] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [availableStartDate, setAvailableStartDate] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [willingToChangeRegion, setWillingToChangeRegion] = useState(false);
  const [remoteAvailability, setRemoteAvailability] = useState(false);
  const [shiftWorkAvailability, setShiftWorkAvailability] = useState(false);
  const [weekendAvailability, setWeekendAvailability] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [contractTypePreference, setContractTypePreference] = useState("any");
  const [educationLevel, setEducationLevel] = useState("none");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [jobSearchDuration, setJobSearchDuration] = useState("active");
  const [activeTab, setActiveTab] = useState("profilo");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get profile
      const { data: profileData } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      setProfile(profileData);
      setFirstName(profileData?.first_name || "");
      setLastName(profileData?.last_name || "");
      setCity(profileData?.city || "");
      setProvince(profileData?.province || "");
      setCountry(profileData?.country || "Italia");
      setPhone(profileData?.phone || "");
      setDesiredJobTitle(profileData?.desired_job_title || "");
      setBirthDate(profileData?.birth_date || "");
      setAvailableStartDate(profileData?.available_start_date || "");
      setWillingToRelocate(profileData?.willing_to_relocate || false);
      setWillingToChangeRegion(profileData?.willing_to_change_region || false);
      setRemoteAvailability(profileData?.remote_availability || false);
      setShiftWorkAvailability(profileData?.shift_work_availability || false);
      setWeekendAvailability(profileData?.weekend_availability || false);
      setProfileImageUrl(profileData?.profile_image_url || "");
      setCvUrl(profileData?.cv_url || "");
      setNotes(profileData?.notes || "");
      setYearsOfExperience(profileData?.years_of_experience?.toString() || "");
      setContractTypePreference(profileData?.contract_type_preference || "any");
      setEducationLevel(profileData?.education_level || "none");
      setSkills(profileData?.skills?.join(", ") || "");
      setLanguages(profileData?.languages?.join(", ") || "");
      setSalaryMin(profileData?.salary_expectation_min?.toString() || "");
      setSalaryMax(profileData?.salary_expectation_max?.toString() || "");
      setJobSearchDuration(profileData?.job_search_duration || "active");

      // Get video interviews
      const { data: videos } = await supabase
        .from("video_interviews")
        .select("*")
        .eq("candidate_id", user?.id)
        .order("created_at", { ascending: false });

      setVideoInterviews(videos || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("candidate_profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          city,
          province,
          country,
          phone,
          desired_job_title: desiredJobTitle,
          birth_date: birthDate || null,
          available_start_date: availableStartDate || null,
          willing_to_relocate: willingToRelocate,
          willing_to_change_region: willingToChangeRegion,
          remote_availability: remoteAvailability,
          shift_work_availability: shiftWorkAvailability,
          weekend_availability: weekendAvailability,
          profile_image_url: profileImageUrl,
          cv_url: cvUrl,
          notes,
          years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          contract_type_preference: contractTypePreference === "any" ? null : contractTypePreference,
          education_level: educationLevel === "none" ? null : educationLevel,
          skills: skills ? skills.split(",").map(s => s.trim()).filter(s => s) : null,
          languages: languages ? languages.split(",").map(l => l.trim()).filter(l => l) : null,
          salary_expectation_min: salaryMin ? parseInt(salaryMin) : null,
          salary_expectation_max: salaryMax ? parseInt(salaryMax) : null,
          job_search_duration: jobSearchDuration,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Profilo salvato",
        description: "Le tue informazioni sono state aggiornate",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il profilo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/photo/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("candidate-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("candidate-photos")
        .getPublicUrl(fileName);

      setProfileImageUrl(publicUrl);

      // Update database immediately to persist the link
      await supabase
        .from("candidate_profiles")
        .update({ profile_image_url: publicUrl })
        .eq("id", user.id);

      toast({
        title: "Foto caricata",
        description: "La tua foto profilo è stata aggiornata",
      });
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile caricare la foto",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setProfileImageUrl("");
    await supabase
      .from("candidate_profiles")
      .update({ profile_image_url: null })
      .eq("id", user?.id);
    toast({
      title: "Foto rimossa",
      description: "La foto profilo è stata rimossa",
    });
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Formato non valido",
        description: "Per favore carica un file PDF",
        variant: "destructive",
      });
      return;
    }

    setUploadingCv(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/cv/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("candidate-cvs")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("candidate-cvs")
        .getPublicUrl(fileName);

      setCvUrl(publicUrl);

      // Update database immediately to persist the link
      await supabase
        .from("candidate_profiles")
        .update({ cv_url: publicUrl })
        .eq("id", user.id);

      toast({
        title: "CV caricato",
        description: "Il tuo curriculum è stato caricato con successo",
      });
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile caricare il CV",
        variant: "destructive",
      });
    } finally {
      setUploadingCv(false);
    }
  };

  const handleRemoveCv = async () => {
    setCvUrl("");
    await supabase
      .from("candidate_profiles")
      .update({ cv_url: null })
      .eq("id", user?.id);
    toast({
      title: "CV rimosso",
      description: "Il curriculum è stato rimosso",
    });
  };

  // Video recording functions
  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          facingMode: "user"
        },
        audio: true
      });

      setStream(mediaStream);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = mediaStream;
      }

      const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedChunks([blob]);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);

        // Stop all tracks
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsRecording(false);
        setMediaRecorder(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedTime(0);

      // Timer
      const timer = setInterval(() => {
        setRecordedTime(prev => prev + 1);
      }, 1000);

      // Store timer to clear later
      (recorder as any)._timer = timer;
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Errore",
        description: "Impossibile accedere alla webcam. Verifica i permessi.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      clearInterval((mediaRecorder as any)._timer);
    }
  };

  const resetRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    setRecordedTime(0);
    setRecordingTitle("");
  };

  const handleSaveVideo = async () => {
    if (!recordedChunks.length || !user) return;

    setUploadingVideo(true);
    try {
      const title = recordingTitle || `Video Intervista ${new Date().toLocaleDateString()}`;
      const blob = recordedChunks[0];
      const fileName = `${user.id}/interviews/${Date.now()}.webm`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from("video_interviews")
        .insert({
          candidate_id: user.id,
          title,
          video_url: publicUrl,
          thumbnail_url: null,
        });

      if (dbError) throw dbError;

      // Refresh interviews list
      const { data: videos } = await supabase
        .from("video_interviews")
        .select("*")
        .eq("candidate_id", user?.id)
        .order("created_at", { ascending: false });

      setVideoInterviews(videos || []);

      toast({
        title: "Video salvato",
        description: "La tua video intervista è stata salvata con successo",
      });

      resetRecording();
    } catch (error: any) {
      console.error("Error saving video:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il video",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from("video_interviews")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVideoInterviews(prev => prev.filter(v => v.id !== id));

      toast({
        title: "Video eliminato",
        description: "La video intervista è stata eliminata",
      });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il video",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5">
        <Header />
        <main className="section-padding">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-jobtv-teal" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5">
      <Header />

      <main className="section-padding">
        <div className="container container-padding max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-jobtv-teal to-jobtv-blue bg-clip-text text-transparent">
              Il tuo Profilo
            </h1>
            <p className="text-gray-600">
              Completa il tuo profilo e registra la tua video intervista
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profilo" className="data-[state=active]:bg-jobtv-teal data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Profilo
              </TabsTrigger>
              <TabsTrigger value="video" className="data-[state=active]:bg-jobtv-teal data-[state=active]:text-white">
                <Video className="w-4 h-4 mr-2" />
                Video Intervista
              </TabsTrigger>
              <TabsTrigger value="documenti" className="data-[state=active]:bg-jobtv-teal data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Documenti
              </TabsTrigger>
            </TabsList>

            {/* TAB PROFILO */}
            <TabsContent value="profilo" className="space-y-6">
              {/* Profile Photo */}
              <Card className="border-jobtv-teal/20 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-jobtv-teal/20 to-jobtv-green/20 border-4 border-jobtv-teal/30 flex items-center justify-center overflow-hidden">
                        {profileImageUrl ? (
                          <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-jobtv-teal/50" />
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                        <div className="absolute bottom-0 right-0 p-2 bg-jobtv-teal rounded-full text-white hover:bg-jobtv-teal/90 cursor-pointer shadow-lg">
                          {uploadingPhoto ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </div>
                      </label>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {firstName || "Il tuo"} {lastName || "Nome"}
                      </h2>
                      <p className="text-jobtv-teal font-medium">
                        {desiredJobTitle || "Candidato"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {city || "Aggiungi la tua città"}
                      </p>
                      <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                        {profileImageUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemovePhoto}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rimuovi
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card className="border-jobtv-teal/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                  <CardTitle className="text-jobtv-teal">Dati Personali</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input
                        placeholder="Mario"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cognome *</Label>
                      <Input
                        placeholder="Rossi"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data di Nascita</Label>
                      <Input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Disponibile dal</Label>
                      <Input
                        type="date"
                        value={availableStartDate}
                        onChange={(e) => setAvailableStartDate(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Note / Bio</Label>
                    <Textarea
                      placeholder="Racconta brevemente di te e delle tue aspirazioni professionali..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="border-jobtv-teal/30 focus:border-jobtv-teal"
                    />
                    <p className="text-xs text-gray-500">{notes?.length || 0}/500</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-jobtv-teal/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                  <CardTitle className="text-jobtv-teal">Contatti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Città *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                        <Input
                          placeholder="Milano"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Provincia</Label>
                      <Input
                        placeholder="MI"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nazione</Label>
                      <Input
                        placeholder="Italia"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefono *</Label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                        <Input
                          type="tel"
                          placeholder="+39 333 1234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Info */}
              <Card className="border-jobtv-teal/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                  <CardTitle className="text-jobtv-teal">Informazioni Professionali</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label>Titolo Lavoro Desiderato</Label>
                    <Input
                      placeholder="es. Sviluppatore Frontend, Project Manager..."
                      value={desiredJobTitle}
                      onChange={(e) => setDesiredJobTitle(e.target.value)}
                      className="border-jobtv-teal/30 focus:border-jobtv-teal"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium">Trasferirsi</div>
                        <div className="text-gray-500">Ti sposti?</div>
                      </div>
                      <Switch
                        checked={willingToRelocate}
                        onCheckedChange={setWillingToRelocate}
                        className="data-[state=checked]:bg-jobtv-teal"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium">Cambia Regione</div>
                        <div className="text-gray-500">Disponibile?</div>
                      </div>
                      <Switch
                        checked={willingToChangeRegion}
                        onCheckedChange={setWillingToChangeRegion}
                        className="data-[state=checked]:bg-jobtv-teal"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium">Turni</div>
                        <div className="text-gray-500">Lavori su turni?</div>
                      </div>
                      <Switch
                        checked={shiftWorkAvailability}
                        onCheckedChange={setShiftWorkAvailability}
                        className="data-[state=checked]:bg-jobtv-teal"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium">Weekend</div>
                        <div className="text-gray-500">Lavori nei weekend?</div>
                      </div>
                      <Switch
                        checked={weekendAvailability}
                        onCheckedChange={setWeekendAvailability}
                        className="data-[state=checked]:bg-jobtv-teal"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium">Lavoro Remoto</div>
                      <div className="text-gray-500">Sei disponibile per lavoro da remoto?</div>
                    </div>
                    <Switch
                      checked={remoteAvailability}
                      onCheckedChange={setRemoteAvailability}
                      className="data-[state=checked]:bg-jobtv-teal"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Professional Info */}
              <Card className="border-jobtv-teal/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                  <CardTitle className="text-jobtv-teal">Informazioni Professionali Avanzate</CardTitle>
                  <CardDescription>Queste informazioni aiutano le aziende a trovarti</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Anni di Esperienza</Label>
                      <Input
                        type="number"
                        placeholder="Es. 3"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo Contratto Preferito</Label>
                      <Select value={contractTypePreference} onValueChange={setContractTypePreference}>
                        <SelectTrigger className="h-12 border-jobtv-teal/30 focus:border-jobtv-teal">
                          <SelectValue placeholder="Seleziona preferenza" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Qualsiasi</SelectItem>
                          <SelectItem value="full-time">Tempo Pieno</SelectItem>
                          <SelectItem value="part-time">Tempo Parziale</SelectItem>
                          <SelectItem value="contract">Contratto Determinato</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Titolo di Studio</Label>
                      <Select value={educationLevel} onValueChange={setEducationLevel}>
                        <SelectTrigger className="h-12 border-jobtv-teal/30 focus:border-jobtv-teal">
                          <SelectValue placeholder="Seleziona titolo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nessuno</SelectItem>
                          <SelectItem value="high-school">Diploma</SelectItem>
                          <SelectItem value="bachelor">Laurea Triennale</SelectItem>
                          <SelectItem value="master">Laurea Magistrale</SelectItem>
                          <SelectItem value="phd">Dottorato</SelectItem>
                          <SelectItem value="other">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Stato Ricerca Lavoro</Label>
                      <Select value={jobSearchDuration} onValueChange={setJobSearchDuration}>
                        <SelectTrigger className="h-12 border-jobtv-teal/30 focus:border-jobtv-teal">
                          <SelectValue placeholder="Seleziona stato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Cerco attivamente</SelectItem>
                          <SelectItem value="passive">Aperto a opportunità</SelectItem>
                          <SelectItem value="not-looking">Non cerco al momento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Competenze (separate da virgola)</Label>
                    <Textarea
                      placeholder="Es. JavaScript, React, Node.js, Python, Excel..."
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="border-jobtv-teal/30 focus:border-jobtv-teal"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500">Elenca le tue competenze principali separandole con virgole</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Lingue parlate (separate da virgola)</Label>
                    <Textarea
                      placeholder="Es. Italiano, Inglese, Francese..."
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      className="border-jobtv-teal/30 focus:border-jobtv-teal"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500">Elenca le lingue che conosci separandole con virgole</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Aspettativa Salariale Minima (€/anno)</Label>
                      <Input
                        type="number"
                        placeholder="Es. 25000"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Aspettativa Salariale Massima (€/anno)</Label>
                      <Input
                        type="number"
                        placeholder="Es. 60000"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        className="border-jobtv-teal/30 focus:border-jobtv-teal"
                        min="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="bg-gradient-to-r from-jobtv-teal to-jobtv-green hover:opacity-90 px-12"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Salvataggio...</>
                  ) : (
                    <><Save className="w-5 h-5 mr-2" /> Salva Profilo</>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* TAB VIDEO INTERVISTA */}
            <TabsContent value="video" className="space-y-6">
              {/* Recording Section */}
              <Card className="border-jobtv-teal/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                  <CardTitle className="text-jobtv-teal">Registra Video Intervista</CardTitle>
                  <CardDescription>
                    Registra una presentazione video di 2-3 minuti per farti notare dalle aziende
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {!isRecording && !recordedVideoUrl && (
                    <div className="text-center py-8">
                      <Video className="w-16 h-16 mx-auto text-jobtv-teal/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Pronto a registrare?</h3>
                      <p className="text-gray-600 mb-6">
                        Assicurati di avere una buona illuminazione e un ambiente tranquillo
                      </p>
                      <Button
                        onClick={startRecording}
                        size="lg"
                        className="bg-gradient-to-r from-jobtv-teal to-jobtv-green hover:opacity-90"
                      >
                        <Mic className="w-5 h-5 mr-2" />
                        Inizia Registrazione
                      </Button>
                    </div>
                  )}

                  {isRecording && (
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={liveVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-white text-sm font-medium">REC {formatTime(recordedTime)}</span>
                        </div>
                      </div>
                      <div className="flex justify-center gap-4">
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          size="lg"
                        >
                          <Square className="w-5 h-5 mr-2" />
                          Ferma Registrazione
                        </Button>
                      </div>
                    </div>
                  )}

                  {recordedVideoUrl && !isRecording && (
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoPreviewRef}
                          src={recordedVideoUrl}
                          controls
                          className="w-full h-64 object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Titolo della video intervista (opzionale)"
                          value={recordingTitle}
                          onChange={(e) => setRecordingTitle(e.target.value)}
                          className="border-jobtv-teal/30 focus:border-jobtv-teal"
                        />
                        <div className="flex justify-center gap-4">
                          <Button
                            onClick={handleSaveVideo}
                            disabled={uploadingVideo}
                            className="bg-gradient-to-r from-jobtv-teal to-jobtv-green hover:opacity-90"
                          >
                            {uploadingVideo ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvataggio...</>
                            ) : (
                              <><Save className="w-4 h-4 mr-2" /> Salva Video</>
                            )}
                          </Button>
                          <Button
                            onClick={resetRecording}
                            variant="outline"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Registra di nuovo
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Consigli per una buona video intervista:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Scegli un luogo ben illuminato e silenzioso</li>
                      <li>• Indossa abbigliamento professionale</li>
                      <li>• Parla in modo chiaro e a un buon volume</li>
                      <li>• Presenta: chi sei, competenze, cosa cerchi</li>
                      <li>• Durata ideale: 2-3 minuti</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Videos */}
              {videoInterviews.length > 0 && (
                <Card className="border-jobtv-teal/20 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                    <CardTitle className="text-jobtv-teal">Le tue Video Interviste</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {videoInterviews.map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <Video className="w-5 h-5 text-jobtv-teal mb-2" />
                          <p className="font-medium">{video.title || "Senza titolo"}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(video.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(video.video_url, '_blank')}
                            className="border-jobtv-teal text-jobtv-teal hover:bg-jobtv-teal/10"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Vedi
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Elimina
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB DOCUMENTI */}
            <TabsContent value="documenti" className="space-y-6">
              {/* CV Upload */}
              <Card className="border-jobtv-teal/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                  <CardTitle className="text-jobtv-teal">Curriculum Vitae</CardTitle>
                  <CardDescription>
                    Carica il tuo CV in formato PDF
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {cvUrl ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">CV Caricato</p>
                          <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:underline"
                          >
                            Visualizza CV
                          </a>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveCv}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Rimuovi
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-jobtv-teal/30 rounded-lg bg-jobtv-teal/5">
                      <FileText className="w-12 h-12 mx-auto text-jobtv-teal/50 mb-3" />
                      <p className="text-gray-600 mb-4">
                        Carica il tuo CV in formato PDF
                      </p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          ref={cvInputRef}
                          className="hidden"
                          accept=".pdf"
                          onChange={handleCvUpload}
                        />
                        <Button
                          asChild
                          onClick={() => cvInputRef.current?.click()}
                          disabled={uploadingCv}
                          className="bg-gradient-to-r from-jobtv-teal to-jobtv-green hover:opacity-90"
                        >
                          <span>
                            {uploadingCv ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Caricamento...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Carica CV
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
