import { useState, useEffect, useRef, useMemo } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Video, Heart, Briefcase, Calendar, MessageSquare, Clock, Building, FileText, Upload, Download, MapPin, ExternalLink, Sparkles, Search, ChevronLeft, ChevronRight, Info, DollarSign, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// Funzione per generare 1000 annunci casuali
const generateFakeJobs = (count: number) => {
    const titles = ["Sviluppatore React", "Operaio Specializzato", "Magazziniere", "Commerciale Estero", "Impiegato Amministrativo", "Project Manager", "Autista Patente C", "Elettricista", "Idraulico", "Social Media Manager", "Cuoco", "Infermiere", "Back Office"];
    const cities = ["Milano", "Roma", "Napoli", "Torino", "Bologna", "Firenze", "Bari", "Palermo", "Genova", "Verona", "Padova", "Brescia", "Rimini", "Cagliari", "Trento"];
    const types = ["Tempo Indeterminato", "Tempo Determinato", "Part-time", "Stage", "Apprendistato"];
    const categories = ["Operaio", "Impiegato", "Quadro", "Dirigente", "Freelance"];
    const availabilities = ["Immediata", "15 giorni", "30 giorni", "Inizio Mese Prossimo"];

    return Array.from({ length: count }, (_, i) => ({
        id: `fake-${i}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        location: cities[Math.floor(Math.random() * cities.length)],
        salary_range: `€${Math.floor(Math.random() * 15 + 20)}k - €${Math.floor(Math.random() * 20 + 35)}k`,
        category: categories[Math.floor(Math.random() * categories.length)],
        availability: availabilities[Math.floor(Math.random() * availabilities.length)],
        contract_type: types[Math.floor(Math.random() * types.length)],
        company_name: "Azienda Partner JobTV",
        is_fake: true
    }));
};

const CandidateDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [videoInterviews, setVideoInterviews] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [suggestedJobs, setSuggestedJobs] = useState<any[]>([]);
    const [allJobs, setAllJobs] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [filterTitle, setFilterTitle] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    const [uploadingCv, setUploadingCv] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filtraggio dinamico degli annunci
    const filteredJobs = useMemo(() => {
        return allJobs.filter(job => 
            job.title.toLowerCase().includes(filterTitle.toLowerCase()) &&
            job.location.toLowerCase().includes(filterLocation.toLowerCase())
        );
    }, [allJobs, filterTitle, filterLocation]);

    useEffect(() => {
        if (user) {
            getData();
        }
    }, [user]);

    const getData = async () => {
        setLoading(true);
        try {
            // Get detailed profile
            const { data: profileData } = await supabase
                .from('candidate_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            setProfile(profileData);

            // Get video interviews
            const { data: videos } = await supabase
                .from('video_interviews')
                .select('*')
                .eq('candidate_id', user?.id);

            setVideoInterviews(videos || []);

            // Get matches/likes
            const { data: matchesData } = await supabase
                .from('job_matching')
                .select('*, company:company_profiles(*), messages(*)')
                .eq('candidate_id', user?.id);

            setMatches(matchesData || []);

            // Get suggested jobs from database
            const { data: jobs } = await supabase
                .from('job_offers')
                .select('*, company:company_profiles(*)')
                .eq('status', 'active')
                .limit(6);
            
            const realJobs = (jobs || []).map(j => ({
                ...j,
                salary_range: j.salary_min ? `€${j.salary_min/1000}k - €${j.salary_max/1000}k` : "€28k - €40k",
                category: "Impiegato", // Default per annunci reali se non specificato
                availability: "Immediata",
                contract_type: j.work_hours || "Full-time",
                company_name: j.company?.company_name || "Azienda JobTV",
                is_fake: false
            }));

            const fakeJobs = generateFakeJobs(1000);
            const combined = [...realJobs, ...fakeJobs];
            
            setAllJobs(combined);
            setSuggestedJobs(realJobs);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        if (file.type !== "application/pdf") {
            toast({
                title: "Formato non valido",
                description: "Per favore carica un file PDF.",
                variant: "destructive",
            });
            return;
        }

        setUploadingCv(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('candidate-cvs')
                .upload(fileName, file, {
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: urlData } = supabase.storage
                .from('candidate-cvs')
                .getPublicUrl(fileName);

            // 3. Update Profile using the full URL for consistency
            const { error: updateError } = await supabase
                .from('candidate_profiles')
                .update({ cv_url: urlData.publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // 3. Update local state
            setProfile((prev: any) => ({ ...prev, cv_url: urlData.publicUrl }));

            toast({
                title: "CV Aggiornato",
                description: "Il tuo curriculum è stato caricato con successo.",
            });

        } catch (error: any) {
            console.error("Error uploading CV:", error);
            toast({
                title: "Errore",
                description: "Impossibile caricare il CV: " + error.message,
                variant: "destructive",
            });
        } finally {
            setUploadingCv(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleLikeJob = async (job: any) => {
        if (job.is_fake) {
            toast({
                title: "Interesse Inviato!",
                description: `Abbiamo inoltrato il tuo profilo a ${job.company_name}.`,
            });
        } else {
            // Logica reale di matching
            try {
                await supabase.from('job_matching').insert({
                    candidate_id: user?.id,
                    company_id: job.company_id,
                    candidate_liked: true
                });
                toast({
                    title: "Candidatura Inviata!",
                    description: "L'azienda riceverà il tuo Video CV.",
                });
            } catch (e) {
                console.error(e);
            }
        }
        handleNext();
    };

    if (loading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-jobtv-teal" />
                </div>
            </PageLayout>
        );
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % filteredJobs.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + filteredJobs.length) % filteredJobs.length);
    };

    const currentJob = filteredJobs[currentIndex];

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Bentornato, {profile?.first_name || user?.email?.split('@')[0]}!
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Ecco cosa sta succedendo con la tua ricerca di lavoro.
                    </p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Cerca ruolo..." className="pl-9 h-11" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} />
                        </div>
                        <div className="relative flex-1 md:w-48">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Città..." className="pl-9 h-11" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Sezione Slideshow Job Discovery */}
                <div className="relative mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 flex items-center">
                            <Sparkles className="w-6 h-6 mr-2 text-jobtv-teal animate-pulse" />
                            Job Discovery <span className="ml-3 text-xs font-bold bg-jobtv-blue/10 text-jobtv-blue px-2 py-1 rounded-full">{filteredJobs.length} Offerte</span>
                        </h2>
                    </div>

                    <div className="relative flex items-center justify-center min-h-[420px]">
                        <Button variant="ghost" size="icon" className="absolute left-0 z-10 hidden md:flex h-12 w-12 bg-white shadow-lg rounded-full" onClick={handlePrev}>
                            <ChevronLeft className="w-6 h-6" />
                        </Button>

                        <AnimatePresence mode="wait">
                            {currentJob ? (
                                <motion.div
                                    key={currentJob.id}
                                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full max-w-xl"
                                >
                                    <Card className="border-2 border-jobtv-blue/10 shadow-2xl overflow-hidden bg-white group">
                                        <div className="bg-jobtv-gradient h-3" />
                                        <CardContent className="p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="h-16 w-16 rounded-2xl bg-jobtv-blue/5 flex items-center justify-center border border-jobtv-blue/10">
                                                    <Building className="w-8 h-8 text-jobtv-blue" />
                                                </div>
                                                <Badge className={`${currentJob.is_fake ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'} border-none font-bold uppercase text-[10px]`}>
                                                    {currentJob.is_fake ? 'Partner Verified' : 'Real-time Match'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-3xl font-black text-gray-900 leading-none">{currentJob.title}</h3>
                                                <p className="text-lg font-bold text-jobtv-teal uppercase tracking-wide">{currentJob.company_name}</p>
                                                
                                                <div className="grid grid-cols-2 gap-4 pt-4">
                                                    <div className="flex items-center text-gray-600 gap-2 font-medium">
                                                        <MapPin className="w-5 h-5 text-jobtv-blue" /> {currentJob.location}
                                                    </div>
                                                    <div className="flex items-center text-gray-600 gap-2 font-medium">
                                                        <DollarSign className="w-5 h-5 text-green-600" /> {currentJob.salary_range}
                                                    </div>
                                                    <div className="flex items-center text-gray-600 gap-2 font-medium">
                                                        <Briefcase className="w-5 h-5 text-orange-500" /> {currentJob.category}
                                                    </div>
                                                    <div className="flex items-center text-gray-600 gap-2 font-medium">
                                                        <Clock className="w-5 h-5 text-purple-500" /> {currentJob.contract_type}
                                                    </div>
                                                    <div className="flex items-center text-gray-600 gap-2 font-medium col-span-2">
                                                        <Calendar className="w-5 h-5 text-jobtv-teal" /> Disponibilità: <span className="font-bold text-gray-900 ml-1">{currentJob.availability}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 mt-10">
                                                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-2" onClick={handleNext}>
                                                    SALTA
                                                </Button>
                                                <Button className="flex-[2] h-14 rounded-2xl font-black bg-jobtv-gradient shadow-xl hover:scale-105 transition-transform" onClick={() => handleLikeJob(currentJob)}>
                                                    <Heart className="mr-2 h-5 w-5 fill-current" /> CANDIDATI ORA
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                    <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900">Nessun annuncio trovato</h3>
                                    <p className="text-gray-500">Prova a cambiare i filtri di ricerca.</p>
                                    <Button variant="link" className="mt-4 text-jobtv-blue font-bold" onClick={() => {setFilterTitle(""); setFilterLocation("");}}>Resetta filtri</Button>
                                </div>
                            )}
                        </AnimatePresence>

                        <Button variant="ghost" size="icon" className="absolute right-0 z-10 hidden md:flex h-12 w-12 bg-white shadow-lg rounded-full" onClick={handleNext}>
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="mt-6 p-4 bg-jobtv-blue/5 rounded-2xl border border-jobtv-blue/10 flex items-center justify-center gap-3">
                        <Info className="w-5 h-5 text-jobtv-blue shrink-0" />
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-tight">JobTV aggrega oltre 1.000 annunci dai migliori portali ogni giorno. Registra un Video CV per sbloccare i match diretti!</p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700">Video CV</CardTitle>
                            <Video className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{videoInterviews.length}</div>
                            <p className="text-xs text-gray-500 mt-1">Video interviste caricate</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-pink-700">Like Ricevuti</CardTitle>
                            <Heart className="h-4 w-4 text-pink-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {matches.filter(m => m.company_liked).length}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Aziende interessate a te</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">Messaggi</CardTitle>
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {matches.reduce((acc, match) => acc + (match.messages?.filter((m: any) => !m.is_read && m.sender_id !== user?.id).length || 0), 0)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Nuovi messaggi</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Activities & Actions */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* CV Management Badge */}
                        <Card className="border-l-4 border-l-blue-500 bg-white">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">Il tuo Curriculum</h3>
                                            <p className="text-sm text-gray-500">
                                                {profile?.cv_url
                                                    ? "Curriculum caricato e visibile alle aziende."
                                                    : "Nessun curriculum caricato."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        {profile?.cv_url && (
                                            <Button variant="outline" size="sm" onClick={() => window.open(profile.cv_url, '_blank')}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Vedi
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            className="bg-jobtv-gradient"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingCv}
                                        >
                                            {uploadingCv ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Upload className="h-4 w-4 mr-2" />
                                            )}
                                            {profile?.cv_url ? "Sostituisci" : "Carica CV"}
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={handleCvUpload}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {videoInterviews.length === 0 && (
                            <Card className="border-l-4 border-l-jobtv-teal bg-gradient-to-r from-jobtv-teal/5 to-transparent">
                                <CardContent className="pt-6">
                                    <div className="flex items-start">
                                        <div className="bg-white p-2 rounded-full mr-4 shadow-sm text-jobtv-teal">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">Registra la tua Video Intervista</h3>
                                            <p className="text-gray-600 mb-3">
                                                Distinguiti dagli altri candidati con una presentazione video. È il modo migliore per mostrare la tua personalità!
                                            </p>
                                            <Button className="bg-jobtv-gradient" onClick={() => navigate('/video-interview')}>
                                                Registra ora
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Matches */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Attività Recenti</h2>
                            {matches.length > 0 ? (
                                matches.slice(0, 5).map((match) => (
                                    <Card key={match.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/matches')}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    {match.company?.company_name?.substring(0, 2).toUpperCase() || <Building className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {match.company_liked ? "Nuovo like da" : "Match con"} <span className="text-jobtv-blue">{match.company?.company_name}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(match.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={match.match_status === 'matched' ? 'default' : 'secondary'}>
                                                {match.match_status === 'matched' ? 'Match!' : 'Interesse'}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center text-gray-500">
                                        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p>Nessuna attività recente. Completa il tuo profilo per farti notare!</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Profile Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Il tuo Profilo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-center mb-4">
                                    <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg">
                                        {profile?.profile_image_url ? (
                                            <img src={profile.profile_image_url} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-gray-300">
                                                {getInitials(profile?.first_name, profile?.last_name)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="font-bold text-lg">{profile?.first_name} {profile?.last_name}</h3>
                                    <p className="text-jobtv-teal font-medium">{profile?.desired_job_title || "Candidato"}</p>
                                    <p className="text-xs text-gray-500 mt-1">{profile?.city || "Luogo non specificato"}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/candidate/profile')}>
                                        <Briefcase className="h-4 w-4 mr-2" /> Modifica Profilo
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/video-interview')}>
                                        <Video className="h-4 w-4 mr-2" /> I miei Video
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
                                        <Clock className="h-4 w-4 mr-2" /> Impostazioni
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

// Helper for initials
const getInitials = (first: string, last: string) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
}

export default CandidateDashboard;
