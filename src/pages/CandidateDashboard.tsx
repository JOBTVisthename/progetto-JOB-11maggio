import { useState, useEffect, useRef } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Video, Heart, Briefcase, Calendar, MessageSquare, Clock, Building, FileText, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CandidateDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [videoInterviews, setVideoInterviews] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [uploadingCv, setUploadingCv] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            // 2. Update Profile using only the fileName path
            const { error: updateError } = await supabase
                .from('candidate_profiles')
                .update({ cv_url: fileName })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // 3. Update local state
            setProfile((prev: any) => ({ ...prev, cv_url: fileName }));

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

    if (loading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-jobtv-teal" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Bentornato, {profile?.first_name || user?.email?.split('@')[0]}!
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Ecco cosa sta succedendo con la tua ricerca di lavoro.
                    </p>
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
