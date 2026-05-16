
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    Search,
    MessageSquare,
    TrendingUp,
    Eye,
    Briefcase,
    UserCheck,
    Clock,
    ArrowUpRight,
    Plus,
    Calendar,
    MapPin
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Types for our dashboard data
type MatchingStats = {
    total: number;
    liked: number;
    matched: number;
    contacted: number;
};

type ViewStats = {
    profileViews: number;
    jobViews: number;
};

type RecentActivity = {
    id: string;
    type: 'match' | 'message' | 'view';
    candidateName: string;
    candidateId: string;
    timestamp: string;
    details?: string;
};

type JobOffer = {
    id: string;
    title: string;
    location: string;
    created_at: string;
    status: string;
};

const CompanyDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showNewOfferPopup, setShowNewOfferPopup] = useState(false);
    const [stats, setStats] = useState<MatchingStats>({
        total: 0,
        liked: 0,
        matched: 0,
        contacted: 0
    });
    const [views, setViews] = useState<ViewStats>({
        profileViews: 0,
        jobViews: 0
    });
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Matching Stats
                const { data: matches, error: matchesError } = await supabase
                    .from('job_matching')
                    .select('*')
                    .eq('company_id', user.id);

                if (matchesError) throw matchesError;

                const liked = matches?.filter(m => m.company_liked).length || 0;
                const matched = matches?.filter(m => m.match_status === 'matched' || (m.candidate_liked && m.company_liked)).length || 0;

                // Count messages sent by this company
                const { data: messagesData } = await supabase
                    .from('messages')
                    .select('id')
                    .eq('sender_id', user.id);

                const contacted = messagesData?.length || 0;

                setStats({
                    total: matches?.length || 0,
                    liked,
                    matched,
                    contacted
                });

                // 2. Fetch Recent Activity - Get candidate IDs first, then batch fetch profiles
                const recentMatches = matches
                    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5) || [];

                const candidateIds = recentMatches.map(m => m.candidate_id);

                let candidateProfiles: { [key: string]: { first_name: string | null; last_name: string | null } } = {};
                if (candidateIds.length > 0) {
                    const { data: candidates } = await supabase
                        .from('candidate_profiles')
                        .select('id, first_name, last_name')
                        .in('id', candidateIds);

                    candidateProfiles = (candidates || []).reduce((acc, c) => {
                        acc[c.id] = { first_name: c.first_name, last_name: c.last_name };
                        return acc;
                    }, {} as typeof candidateProfiles);
                }

                // 4. Fetch Recent Job Offers
                const { data: jobOffers, error: jobsError } = await supabase
                    .from('job_offers')
                    .select('id, title, location, created_at, status')
                    .eq('company_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (jobsError) throw jobsError;
                setRecentJobs(jobOffers || []);

                const activities: RecentActivity[] = recentMatches.map(m => {
                    const candidate = candidateProfiles[m.candidate_id];
                    return {
                        id: m.id,
                        type: m.match_status === 'matched' || (m.candidate_liked && m.company_liked) ? 'match' : 'view',
                        candidateName: candidate ? `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Candidato' : 'Candidato',
                        candidateId: m.candidate_id,
                        timestamp: m.created_at,
                        details: m.match_status === 'matched' || (m.candidate_liked && m.company_liked) ? 'Match reciproco' : m.company_liked ? 'Mi piace inviato' : 'Profilo visualizzato'
                    };
                });

                setActivities(activities);

                // 3. Generate Chart Data - Aggregate matches by day of week from real data
                const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
                const chartDataMap = new Map<string, { views: number; matches: number; messages: number }>();
                
                // Initialize all days with 0
                daysOfWeek.forEach(day => {
                    chartDataMap.set(day, { views: 0, matches: 0, messages: 0 });
                });

                // Aggregate matches by day of week
                matches?.forEach(match => {
                    const date = new Date(match.created_at);
                    const dayName = daysOfWeek[date.getDay()];
                    const dayData = chartDataMap.get(dayName) || { views: 0, matches: 0, messages: 0 };
                    dayData.matches++;
                    dayData.views++; // Count each match as a view
                    chartDataMap.set(dayName, dayData);
                });

                // Convert map to array
                const data = daysOfWeek.map(day => ({
                    name: day,
                    views: chartDataMap.get(day)?.views || 0,
                    matches: chartDataMap.get(day)?.matches || 0,
                    messages: 0 // Messages would require separate query from messages table
                }));
                setChartData(data);

                // Calculate real view stats from matches
                const profileViews = matches?.length || 0;
                const jobViews = matches?.filter(m => m.match_status === 'matched').length || 0;
                setViews({
                    profileViews,
                    jobViews
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <PageLayout>
                <div className="container mx-auto px-4 py-8 space-y-8">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </PageLayout>
        )
    }

    return (
        <PageLayout>
            <div className="min-h-screen bg-gray-50/50 pb-12">
                <div className="container mx-auto px-4 py-8">
                    <Dialog open={showNewOfferPopup} onOpenChange={setShowNewOfferPopup}>
                        <DialogContent className="sm:max-w-sm bg-white/95 backdrop-blur-md shadow-2xl border border-gray-100">
                            <DialogHeader>
                                <DialogTitle className="text-center">Nuova Offerta</DialogTitle>
                                <DialogDescription className="text-center">
                                    CLICCA QUI E METTI ANNUNCIO
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 gap-3 mt-2">
                                <Button
                                    className="w-full bg-jobtv-gradient text-white shadow-lg hover:scale-105 transition-all duration-300"
                                    onClick={() => {
                                        setShowNewOfferPopup(false);
                                        navigate("/create-job-offer");
                                    }}
                                >
                                    Vai a pubblicare
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => setShowNewOfferPopup(false)}>
                                    Annulla
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Aziendale</h1>
                            <p className="text-gray-500 mt-2">Bentornato! Ecco le performance delle tue attività di recruiting.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <Button
                                className="bg-jobtv-gradient text-white border-0 shadow-lg hover:scale-105 transition-all duration-300"
                                onClick={() => setShowNewOfferPopup(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Nuova Offerta
                            </Button>
                            <Button asChild className="bg-jobtv-gradient text-white border-0">
                                <Link to="/search-candidates">
                                    <Search className="mr-2 h-4 w-4" />
                                    Cerca Candidati
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Candidati Visualizzati"
                            value={stats.total}
                            icon={Eye}
                            trend="+12%"
                            color="text-blue-600"
                            bgColor="bg-blue-100"
                        />
                        <StatCard
                            title="Match Confermati"
                            value={stats.matched}
                            icon={UserCheck}
                            trend="+5%"
                            color="text-green-600"
                            bgColor="bg-green-100"
                        />
                        <StatCard
                            title="Messaggi Inviati"
                            value={stats.contacted} // Using contacted/matched as proxy 
                            icon={MessageSquare}
                            trend="+18%"
                            color="text-purple-600"
                            bgColor="bg-purple-100"
                        />
                        <StatCard
                            title="Visualizzazioni Profilo"
                            value={views.profileViews}
                            icon={TrendingUp}
                            trend="+24%"
                            color="text-orange-600"
                            bgColor="bg-orange-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Main Chart */}
                        <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-100">
                            <CardHeader>
                                <CardTitle>Andamento Attività</CardTitle>
                                <CardDescription>Visualizzazioni e Match negli ultimi 7 giorni</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 8 }} name="Visualizzazioni" />
                                            <Area type="monotone" dataKey="matches" stroke="#82ca9d" fillOpacity={1} fill="url(#colorMatches)" name="Match" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="col-span-1 shadow-sm border-gray-100">
                            <CardHeader>
                                <CardTitle>Attività Recenti</CardTitle>
                                <CardDescription>Ultime interazioni con i candidati</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {activities.length > 0 ? (
                                        activities.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-full ${activity.type === 'match' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {activity.type === 'match' ? <UserCheck className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {activity.details}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {activity.candidateName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(activity.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Nessuna attività recente
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <Button variant="ghost" className="w-full text-sm text-gray-500 hover:text-gray-900" asChild>
                                        <Link to="/matches">
                                            Vedi tutti i match <ArrowUpRight className="ml-2 w-3 h-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Job Offers List */}
                    <Card className="mb-8 shadow-sm border-gray-100">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Ultime Offerte Pubblicate</CardTitle>
                                <CardDescription>Le tue posizioni aperte più recenti</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/create-job-offer">Vedi tutte</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentJobs.length > 0 ? (
                                    recentJobs.map((job) => (
                                        <div key={job.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-jobtv-blue/5 rounded-lg group-hover:bg-jobtv-blue/10 transition-colors">
                                                    <Briefcase className="w-5 h-5 text-jobtv-blue" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-jobtv-blue transition-colors">{job.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <MapPin className="w-3 h-3 mr-1" /> {job.location}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" /> {new Date(job.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {job.status === 'active' ? 'Attiva' : 'Archiviata'}
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-jobtv-blue h-8 w-8">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                        <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p>Non hai ancora pubblicato offerte di lavoro.</p>
                                        <Button variant="link" asChild className="mt-2 text-jobtv-blue">
                                            <Link to="/create-job-offer">Crea la tua prima offerta</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions & Suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="shadow-sm border-gray-100">
                            <CardHeader>
                                <CardTitle>Azioni Rapide</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-jobtv-blue/20 bg-jobtv-blue/5 hover:bg-jobtv-blue/10 hover:border-jobtv-blue transition-colors group" asChild>
                                    <Link to="/create-job-offer">
                                        <Briefcase className="h-6 w-6 text-jobtv-blue group-hover:scale-110 transition-transform" />
                                        <span className="font-semibold text-jobtv-blue">Crea Offerta</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-jobtv-blue hover:text-jobtv-blue transition-colors" asChild>
                                    <Link to="/search-candidates">
                                        <Search className="h-6 w-6" />
                                        <span>Cerca Talenti</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-jobtv-blue hover:text-jobtv-blue transition-colors" asChild>
                                    <Link to="/profile">
                                        <Briefcase className="h-6 w-6" />
                                        <span>Modifica Profilo</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-jobtv-blue hover:text-jobtv-blue transition-colors" asChild>
                                    <Link to="/messages">
                                        <MessageSquare className="h-6 w-6" />
                                        <span>Messaggi</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-jobtv-blue hover:text-jobtv-blue transition-colors" asChild>
                                    <Link to="/settings">
                                        <Users className="h-6 w-6" />
                                        <span>Impostazioni</span>
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-jobtv-blue/5 to-jobtv-teal/5 border-jobtv-blue/10">
                            <CardHeader>
                                <CardTitle>Suggerimento del Giorno</CardTitle>
                                <CardDescription>Come migliorare il tuo recruiting</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                        <TrendingUp className="h-6 w-6 text-jobtv-blue" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Completa il profilo aziendale</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                            Le aziende con profili completi (logo, descrizione dettagliata e foto dell'ambiente di lavoro) ricevono il 45% in più di risposte dai candidati.
                                        </p>
                                        <Button size="sm" asChild>
                                            <Link to="/profile">Aggiorna Ora</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-gray-100">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : null}
                    <span>{trend}</span>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
        </CardContent>
    </Card>
);

export default CompanyDashboard;
