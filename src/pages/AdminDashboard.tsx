import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Building,
  CreditCard,
  LogOut,
  Edit,
  Trash2,
  Key,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Crown,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Settings,
  FileText,
  UserCheck,
  Building2,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row'];
type CompanyProfile = Database['public']['Tables']['company_profiles']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type PaymentRecord = Database['public']['Tables']['payment_records']['Row'];
type SubscriptionUsage = Database['public']['Tables']['subscription_usage']['Row'];
type StripeEvent = Database['public']['Tables']['stripe_events']['Row'];

interface UserWithProfile extends UserProfile {
  candidate_profiles?: CandidateProfile | null;
  company_profiles?: CompanyProfile | null;
  subscriptions?: Subscription[] | Subscription | null;
  subscription_usage?: SubscriptionUsage | null;
  email?: string;
}

interface PaymentWithUser extends PaymentRecord {
  user_email?: string;
  user_name?: string;
}

interface StatsData {
  totalUsers: number;
  totalCandidates: number;
  totalCompanies: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingPayments: number;
  expiredSubscriptions: number;
  trialUsers: number;
  monthlyRevenue: number;
  subscriptionGrowth: number;
}

const AdminDashboard = () => {
  const { isAdmin, user: adminUser, logoutAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main data states
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [payments, setPayments] = useState<PaymentWithUser[]>([]);
  const [stripeEvents, setStripeEvents] = useState<StripeEvent[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalCandidates: 0,
    totalCompanies: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    expiredSubscriptions: 0,
    trialUsers: 0,
    monthlyRevenue: 0,
    subscriptionGrowth: 0
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userFilter, setUserFilter] = useState<'all' | 'candidate' | 'company'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'canceled' | 'trialing' | 'past_due'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'succeeded' | 'pending' | 'failed' | 'refunded'>('all');
  const itemsPerPage = 20;

  // Dialog states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      if (isAdmin && users.length === 0) {
        fetchAllData();
      }
    }
  }, [isAdmin, authLoading]);

  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch users directly with pagination using admin client
      const allUsers = await fetchAllUsersWithPagination();
      setUsers(allUsers);

      // Fetch payments - don't block if this fails
      try {
        const paymentsData = await fetchPayments();
        calculateStats(allUsers, paymentsData);
      } catch (paymentError) {
        console.error('Payments fetch error:', paymentError);
        calculateStats(allUsers, []);
      }

      // Fetch stripe events - don't block if this fails
      try {
        const eventsData = await fetchStripeEvents();
        setStripeEvents(eventsData);
      } catch (eventsError) {
        console.error('Events fetch error:', eventsError);
        setStripeEvents([]);
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      // Only show toast for critical errors
      toast({
        title: "Errore nel caricamento",
        description: error.message || "Impossibile caricare i dati.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchAllUsersWithPagination = async (): Promise<UserWithProfile[]> => {
    const allUsers: UserWithProfile[] = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    // First, fetch all profiles without subscriptions
    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          user_type,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching users batch:', error);
        throw error;
      }

      if (data && data.length > 0) {
        allUsers.push(...data as UserWithProfile[]);
        offset += limit;

        // If we got less than the limit, we've reached the end
        if (data.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Fetched ${allUsers.length} total profiles from database`);

    // Now fetch candidate profiles
    const { data: candidateProfiles } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id, first_name, last_name, profile_image_url, desired_job_title');

    // Now fetch company profiles
    const { data: companyProfiles } = await supabaseAdmin
      .from('company_profiles')
      .select('id, company_name, profile_image_url, vat_number, phone');

    // Attach profiles to users
    const candidateMap = new Map(candidateProfiles?.map(p => [p.id, p]) || []);
    const companyMap = new Map(companyProfiles?.map(p => [p.id, p]) || []);

    allUsers.forEach(user => {
      if (user.user_type === 'candidate') {
        (user as any).candidate_profiles = candidateMap.get(user.id) || null;
      } else if (user.user_type === 'company') {
        (user as any).company_profiles = companyMap.get(user.id) || null;
        
        // Fetch additional stats for companies (Job Offers, Videos, Likes)
        const { count: jobCount } = await supabaseAdmin.from('job_offers').select('*', { count: 'exact', head: true }).eq('company_id', user.id);
        const { count: videoCount } = await supabaseAdmin.from('video_interviews').select('*', { count: 'exact', head: true }).eq('company_id', user.id);
        const { data: likes } = await supabaseAdmin.from('job_matching').select('id').eq('company_id', user.id).eq('candidate_liked', true);
        
        (user as any).job_offers_count = jobCount || 0;
        (user as any).videos_count = videoCount || 0;
        (user as any).total_likes = likes?.length || 0;
        (user as any).email = (await supabaseAdmin.auth.admin.getUserById(user.id)).data.user?.email;
      }
    });

    console.log(`✅ Attached ${candidateMap.size} candidate profiles and ${companyMap.size} company profiles`);

    // Now fetch subscriptions only for companies and attach them
    const companyIds = allUsers.filter(u => u.user_type === 'company').map(u => u.id);

    if (companyIds.length > 0) {
      // Fetch subscriptions in batches (Supabase limit for IN clause)
      const subscriptionsBatchSize = 100;
      const allSubscriptions: any[] = [];

      for (let i = 0; i < companyIds.length; i += subscriptionsBatchSize) {
        const batchIds = companyIds.slice(i, i + subscriptionsBatchSize);

        const { data: subs } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .in('user_id', batchIds);

        if (subs) {
          allSubscriptions.push(...subs);
        }
      }

      console.log(`✅ Fetched ${allSubscriptions.length} subscriptions for ${companyIds.length} companies`);

      // Group subscriptions by user_id
      const subsByUserId: Record<string, any[]> = {};
      allSubscriptions.forEach(sub => {
        if (!subsByUserId[sub.user_id]) {
          subsByUserId[sub.user_id] = [];
        }
        subsByUserId[sub.user_id].push(sub);
      });

      // Attach subscriptions to users
      allUsers.forEach(user => {
        if (subsByUserId[user.id]) {
          user.subscriptions = subsByUserId[user.id];
        } else {
          user.subscriptions = null;
        }
      });
    }

    return allUsers;
  };

  const fetchPayments = async (): Promise<PaymentWithUser[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('payment_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        // Table doesn't exist - return empty array
        if (error.code === '42P01') {
          console.log('payment_records table does not exist yet - skipping');
          return [];
        }
        console.error('Payments fetch error:', error);
        return [];
      }
      return data as PaymentWithUser[];
    } catch (error: any) {
      // Table doesn't exist - return empty array
      if (error?.code === '42P01') {
        console.log('payment_records table does not exist yet - skipping');
        return [];
      }
      console.error('Error fetching payments:', error);
      return [];
    }
  };

  const fetchStripeEvents = async (): Promise<StripeEvent[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('stripe_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Table doesn't exist - return empty array
        if (error.code === '42P01') {
          console.log('stripe_events table does not exist yet - skipping');
          return [];
        }
        console.error('Events fetch error:', error);
        return [];
      }
      return data || [];
    } catch (error: any) {
      // Table doesn't exist - return empty array
      if (error?.code === '42P01') {
        console.log('stripe_events table does not exist yet - skipping');
        return [];
      }
      console.error('Error fetching stripe events:', error);
      return [];
    }
  };

  const calculateStats = (usersData: UserWithProfile[], paymentsData: PaymentWithUser[]) => {
    const candidates = usersData.filter(u => u.user_type === 'candidate');
    const companies = usersData.filter(u => u.user_type === 'company');

    const activeSubs = companies.filter(c => {
      const sub = Array.isArray(c.subscriptions) ? c.subscriptions[0] : c.subscriptions;
      return sub?.status === 'active';
    }).length;

    const trialUsers = companies.filter(c => {
      const sub = Array.isArray(c.subscriptions) ? c.subscriptions[0] : c.subscriptions;
      return sub?.trial_end && new Date(sub.trial_end) > new Date();
    }).length;

    const succeededPayments = paymentsData.filter(p => p.status === 'succeeded');
    const totalRevenue = succeededPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const thisMonth = succeededPayments.filter(p => {
      const paymentDate = new Date(p.created_at);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = thisMonth.reduce((sum, p) => sum + (p.amount || 0), 0);

    setStats({
      totalUsers: usersData.length,
      totalCandidates: candidates.length,
      totalCompanies: companies.length,
      activeSubscriptions: activeSubs,
      totalRevenue: totalRevenue,
      pendingPayments: paymentsData.filter(p => p.status === 'pending').length,
      expiredSubscriptions: companies.filter(c => {
        const sub = Array.isArray(c.subscriptions) ? c.subscriptions[0] : c.subscriptions;
        return sub?.status === 'canceled' || sub?.status === 'past_due';
      }).length,
      trialUsers: trialUsers,
      monthlyRevenue: monthlyRevenue,
      subscriptionGrowth: Math.round((activeSubs / Math.max(companies.length, 1)) * 100)
    });

    setPayments(paymentsData);
  };

  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payment_records')
        .update({ status: 'succeeded', verified: true })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Pagamento verificato",
        description: "Il pagamento è stato contrassegnato come verificato.",
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRefundPayment = async (paymentId: string) => {
    if (!confirm('Sei sicuro di voler rimborsare questo pagamento?')) return;

    try {
      const { error } = await supabase
        .from('payment_records')
        .update({ status: 'refunded' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Rimborso effettuato",
        description: "Il pagamento è stato rimborsato.",
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = async (userId: string, action: 'cancel' | 'reactivate' | 'upgrade' | 'downgrade', planType?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-task-proxy', {
        body: {
          action: 'update_subscription',
          payload: { userId, action, planType }
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Abbonamento aggiornato",
        description: "L'operazione è stata completata con successo.",
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      active: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Attivo' },
      canceled: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancellato' },
      past_due: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle, label: 'In ritardo' },
      trialing: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, label: 'Trial' },
      incomplete: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle, label: 'Incompleto' },
      succeeded: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Riuscito' },
      pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'In attesa' },
      failed: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Fallito' },
      refunded: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: RefreshCw, label: 'Rimborsato' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-jobtv-teal mx-auto mb-4" />
          <p className="text-gray-600">Verifica permessi admin...</p>
        </div>
      </div>
    );
  }

  // Filter logic
  const filteredUsers = users.filter(user => {
    const matchesType = userFilter === 'all' || user.user_type === userFilter;

    const matchesSubscription = subscriptionFilter === 'all' || (() => {
      const sub = Array.isArray(user.subscriptions) ? user.subscriptions[0] : user.subscriptions;
      if (!sub) return subscriptionFilter === 'all';
      return sub.status === subscriptionFilter;
    })();

    const matchesSearch = !searchTerm || (() => {
      const name = user.user_type === 'candidate'
        ? `${user.candidate_profiles?.first_name || ''} ${user.candidate_profiles?.last_name || ''}`.toLowerCase()
        : user.company_profiles?.company_name?.toLowerCase() || '';
      const email = (user.email || '').toLowerCase();
      const id = (user.id || '').toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase());
    })();

    return matchesType && matchesSubscription && matchesSearch;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = paymentStatusFilter === 'all' || payment.status === paymentStatusFilter;
    const matchesSearch = !searchTerm ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment as any).user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-jobtv-teal to-jobtv-blue p-2.5 rounded-xl shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-500">Gestione completa piattaforma</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{adminUser?.email}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchAllData}
                disabled={isRefreshing}
                className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
              >
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Aggiorna
              </Button>
              <Button variant="outline" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 lg:grid-cols-6 w-full">
            <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-jobtv-teal data-[state=active]:to-jobtv-blue data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-jobtv-teal data-[state=active]:to-jobtv-blue data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Utenti
            </TabsTrigger>
            <TabsTrigger value="companies" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-jobtv-teal data-[state=active]:to-jobtv-blue data-[state=active]:text-white">
              <Building2 className="h-4 w-4 mr-2" />
              Aziende
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-jobtv-teal data-[state=active]:to-jobtv-blue data-[state=active]:text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Abbonamenti
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-jobtv-teal data-[state=active]:to-jobtv-blue data-[state=active]:text-white">
              <DollarSign className="h-4 w-4 mr-2" />
              Pagamenti
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-jobtv-teal data-[state=active]:to-jobtv-blue data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              Eventi
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Utenti Totali"
                value={stats.totalUsers}
                icon={Users}
                color="from-blue-500 to-blue-600"
                change={stats.totalCandidates}
                changeLabel="Candidati"
              />
              <StatCard
                title="Aziende"
                value={stats.totalCompanies}
                icon={Building}
                color="from-purple-500 to-purple-600"
                change={stats.activeSubscriptions}
                changeLabel="Con abbonamento attivo"
              />
              <StatCard
                title="Fatturato Totale"
                value={formatCurrency(stats.totalRevenue)}
                icon={DollarSign}
                color="from-green-500 to-green-600"
                change={formatCurrency(stats.monthlyRevenue)}
                changeLabel="Questo mese"
              />
              <StatCard
                title="Pagamenti Pendenti"
                value={stats.pendingPayments}
                icon={Clock}
                color="from-orange-500 to-orange-600"
                change={stats.expiredSubscriptions}
                changeLabel="Abbonamenti scaduti"
                negative
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-jobtv-teal" />
                    Azioni Rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setActiveTab('users')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-jobtv-teal hover:bg-jobtv-teal/5">
                    <UserCheck className="h-6 w-6 text-jobtv-blue" />
                    <span className="text-sm font-medium">Gestisci Utenti</span>
                  </Button>
                  <Button onClick={() => setActiveTab('companies')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-jobtv-teal hover:bg-jobtv-teal/5">
                    <Building2 className="h-6 w-6 text-jobtv-purple" />
                    <span className="text-sm font-medium">Gestisci Aziende</span>
                  </Button>
                  <Button onClick={() => setActiveTab('subscriptions')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-jobtv-teal hover:bg-jobtv-teal/5">
                    <CreditCard className="h-6 w-6 text-jobtv-teal" />
                    <span className="text-sm font-medium">Gestisci Abbonamenti</span>
                  </Button>
                  <Button onClick={() => setActiveTab('payments')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-jobtv-teal hover:bg-jobtv-teal/5">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">Verifica Pagamenti</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-jobtv-teal" />
                    Statistiche Abbonamenti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tasso di conversione</span>
                    <span className="font-semibold text-lg">{stats.subscriptionGrowth}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-jobtv-teal to-jobtv-blue h-2 rounded-full" style={{ width: `${stats.subscriptionGrowth}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                      <p className="text-xs text-gray-500">Attivi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.trialUsers}</p>
                      <p className="text-xs text-gray-500">Trial</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stats.expiredSubscriptions}</p>
                      <p className="text-xs text-gray-500">Scaduti</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-jobtv-teal" />
                  Eventi Recenti Stripe
                </CardTitle>
                <CardDescription>Ultimi eventi webhook ricevuti da Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stripeEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${event.processed ? 'bg-green-100' : 'bg-yellow-100'}`}>
                          {event.processed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{event.event_type}</p>
                          <p className="text-xs text-gray-500">{formatDate(event.created_at)}</p>
                        </div>
                      </div>
                      <Badge variant={event.processed ? "default" : "outline"} className={event.processed ? "bg-green-100 text-green-700" : ""}>
                        {event.processed ? 'Processato' : 'In attesa'}
                      </Badge>
                    </div>
                  ))}
                  {stripeEvents.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Nessun evento recente</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-6">
                <div>
                  <CardTitle>Gestione Utenti</CardTitle>
                  <CardDescription>Tutti gli utenti registrati sulla piattaforma</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="Cerca nome, email, ID..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                  </div>
                  <Select value={userFilter} onValueChange={(v: any) => setUserFilter(v)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filtra tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="candidate">Candidati</SelectItem>
                      <SelectItem value="company">Aziende</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <UsersTable
                  users={paginatedUsers}
                  onManageSubscription={(user) => {
                    setSelectedItem(user);
                    setActiveTab('subscriptions');
                  }}
                />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Gestione Aziende</CardTitle>
                <CardDescription>Gestisci abbonamenti e piani delle aziende</CardDescription>
              </CardHeader>
              <CardContent>
                <CompaniesTable
                  companies={users.filter(u => u.user_type === 'company')}
                  onManageSubscription={(company, action, plan) =>
                    handleManageSubscription(company.id, action, plan)
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Gestione Abbonamenti</CardTitle>
                <CardDescription>Visualizza e gestisci tutti gli abbonamenti attivi</CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionsTable
                  companies={users.filter(u => u.user_type === 'company')}
                  onManageSubscription={handleManageSubscription}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-6">
                <div>
                  <CardTitle>Registro Pagamenti</CardTitle>
                  <CardDescription>Verifica e gestisci tutti i pagamenti</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="Cerca ID, email..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={paymentStatusFilter} onValueChange={(v: any) => setPaymentStatusFilter(v)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="succeeded">Riusciti</SelectItem>
                      <SelectItem value="pending">In attesa</SelectItem>
                      <SelectItem value="failed">Falliti</SelectItem>
                      <SelectItem value="refunded">Rimborsati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <PaymentsTable
                  payments={filteredPayments}
                  onVerify={handleVerifyPayment}
                  onRefund={handleRefundPayment}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Eventi Stripe</CardTitle>
                <CardDescription>Log degli eventi webhook ricevuti da Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stripeEvents.map((event) => (
                    <div key={event.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={event.processed ? "default" : "outline"}>
                            {event.event_type}
                          </Badge>
                          <span className="text-xs text-gray-500 font-mono">{event.stripe_event_id?.slice(0, 20)}...</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.processed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-xs text-gray-500">{formatDate(event.created_at)}</span>
                        </div>
                      </div>
                      {event.error_message && (
                        <p className="text-xs text-red-600 mt-2">{event.error_message}</p>
                      )}
                    </div>
                  ))}
                  {stripeEvents.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Nessun evento trovato</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change, changeLabel, negative = false }: any) => (
  <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {change !== undefined && (
        <div className="flex items-center text-xs mt-1">
          {negative ? (
            <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
          ) : (
            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
          )}
          <span className={negative ? "text-red-600" : "text-green-600"}>
            {change}
          </span>
          <span className="text-gray-500 ml-1">{changeLabel}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, totalCount, itemsPerPage, onPageChange }: any) => (
  <div className="flex items-center justify-between py-4 border-t border-gray-100 px-2 mt-4">
    <div className="text-sm text-gray-500">
      Mostrando <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span>-
      <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, totalCount)}</span> di
      <span className="font-medium text-gray-900"> {totalCount}</span> elementi
    </div>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="h-8"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Prec
      </Button>
      <div className="flex items-center px-3 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg">
        {currentPage} / {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="h-8"
      >
        Succ <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
);

// Users Table Component
const UsersTable = ({ users, onManageSubscription }: any) => {
  const getUserName = (user: any) => {
    if (user.user_type === 'candidate' && user.candidate_profiles) {
      return `${user.candidate_profiles.first_name || ''} ${user.candidate_profiles.last_name || ''}`.trim() || 'N/A';
    }
    if (user.user_type === 'company' && user.company_profiles) {
      return user.company_profiles.company_name || 'N/A';
    }
    return 'N/A';
  };

  const getSubscriptionStatus = (user: any) => {
    const sub = Array.isArray(user.subscriptions) ? user.subscriptions[0] : user.subscriptions;
    return sub?.status || 'none';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-semibold">Utente</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Stato</TableHead>
            <TableHead className="font-semibold">Abbonamento</TableHead>
            <TableHead className="font-semibold">Creato il</TableHead>
            <TableHead className="text-right font-semibold pr-6">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                Nessun utente trovato
              </TableCell>
            </TableRow>
          ) : (
            users.map((user: any) => (
              <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="pl-6">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage src={user.candidate_profiles?.profile_image_url || user.company_profiles?.profile_image_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-medium">
                        {getUserName(user).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">{getUserName(user)}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={user.user_type === 'candidate'
                      ? 'border-teal-200 text-teal-700 bg-teal-50'
                      : 'border-purple-200 text-purple-700 bg-purple-50'
                    }
                  >
                    {user.user_type === 'candidate' ? 'Candidato' : 'Azienda'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={user.role === 'admin'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                  >
                    {user.role === 'admin' ? <Crown className="h-3 w-3 mr-1" /> : null}
                    {user.role || 'user'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.subscriptions ? (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                      {Array.isArray(user.subscriptions)
                        ? (user.subscriptions[0]?.plan_type || 'Starter')
                        : (user.subscriptions.plan_type || 'Starter')}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">Nessuno</span>
                  )}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right pr-6">
                  {user.user_type === 'company' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-jobtv-teal hover:bg-jobtv-teal/5"
                      onClick={() => onManageSubscription(user)}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Gestisci
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Companies Table Component
const CompaniesTable = ({ companies, onManageSubscription }: any) => {
  const getCompanyData = (company: any) => {
    return company.company_profiles || {};
  };

  const getSubscription = (company: any) => {
    if (!company.subscriptions) return null;
    if (Array.isArray(company.subscriptions)) {
      return company.subscriptions.length > 0 ? company.subscriptions[0] : null;
    }
    return company.subscriptions;
  };

  return (
    <div className="space-y-4">
      {companies.filter((c: any) => c.user_type === 'company').map((company: any) => {
        const companyData = getCompanyData(company);
        const subscription = getSubscription(company);

        return (
          <Card key={company.id} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-gray-100">
                    <AvatarImage src={companyData.profile_image_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-bold text-lg">
                      {companyData.company_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{companyData.company_name || 'N/A'}</h3>
                    <div className="space-y-1 mt-1">
                      <p className="text-xs text-gray-500 font-medium">MAIL: <span className="text-jobtv-blue">{company.email || 'N/A'}</span></p>
                      <p className="text-xs text-gray-500 font-medium">P.IVA: <span className="text-gray-700">{companyData.vat_number || 'Non inserita'}</span></p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Job Offers</p>
                        <p className="text-sm font-bold text-jobtv-blue">{company.job_offers_count || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Video</p>
                        <p className="text-sm font-bold text-jobtv-teal">{company.videos_count || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Like Ricevuti</p>
                        <p className="text-sm font-bold text-pink-500">{company.total_likes || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {subscription && (
                        <>
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                            {subscription.plan_type || 'Starter'}
                          </Badge>
                          <Badge variant="outline" className={
                            subscription.status === 'active' ? 'border-green-200 text-green-700 bg-green-50' :
                            subscription.status === 'trialing' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            'border-red-200 text-red-700 bg-red-50'
                          }>
                            {subscription.status === 'active' ? 'Attivo' :
                             subscription.status === 'trialing' ? 'Trial' :
                             subscription.status === 'canceled' ? 'Cancellato' :
                             subscription.status === 'past_due' ? 'In ritardo' : subscription.status}
                          </Badge>
                        </>
                      )}
                      {!subscription && (
                        <Badge variant="outline" className="border-gray-200 text-gray-500">
                          Nessun abbonamento
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Select onValueChange={(plan) => onManageSubscription(company, 'upgrade', plan)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Cambia piano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="builder">Builder</SelectItem>
                      <SelectItem value="hero">Hero</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    {subscription?.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManageSubscription(company, 'cancel')}
                        className="flex-1 hover:text-red-600 hover:border-red-200"
                      >
                        Cancella
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManageSubscription(company, 'reactivate')}
                        className="flex-1 hover:text-green-600 hover:border-green-200"
                      >
                        Riattiva
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {subscription && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID Abbonamento</p>
                    <p className="font-mono text-xs text-gray-700">{subscription.stripe_subscription_id?.slice(0, 20) || '-'}...</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Inizio</p>
                    <p className="text-gray-900">{subscription.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString('it-IT') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rinnovo</p>
                    <p className="text-gray-900">{subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('it-IT') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cliente Stripe</p>
                    <p className="font-mono text-xs text-gray-700">{subscription.stripe_customer_id?.slice(0, 20) || '-'}...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      {companies.filter((c: any) => c.user_type === 'company').length === 0 && (
        <p className="text-center text-gray-500 py-8">Nessuna azienda trovata</p>
      )}
    </div>
  );
};

// Subscriptions Table Component
const SubscriptionsTable = ({ companies, onManageSubscription }: any) => {
  // Properly filter companies that have valid subscriptions
  const companiesWithSubscriptions = companies.filter((c: any) => {
    if (!c.subscriptions) return false;
    if (Array.isArray(c.subscriptions)) return c.subscriptions.length > 0;
    return true;
  });

  return (
    <div className="space-y-4">
      {companiesWithSubscriptions.map((company: any) => {
        // Get subscription with proper null check
        let subscription = null;
        if (Array.isArray(company.subscriptions)) {
          subscription = company.subscriptions.length > 0 ? company.subscriptions[0] : null;
        } else {
          subscription = company.subscriptions;
        }

        if (!subscription) return null;

        const companyData = company.company_profiles || {};

        return (
          <Card key={company.id} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={companyData.profile_image_url || ""} />
                    <AvatarFallback>{companyData.company_name?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{companyData.company_name || 'N/A'}</h4>
                    <p className="text-sm text-gray-500">{company.email}</p>
                  </div>
                </div>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                  {subscription.plan_type || 'Starter'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Stato</p>
                  {subscription.status === 'active' && <Badge className="bg-green-50 text-green-700 border-green-200">Attivo</Badge>}
                  {subscription.status === 'trialing' && <Badge className="bg-blue-50 text-blue-700 border-blue-200">Trial</Badge>}
                  {subscription.status === 'canceled' && <Badge variant="outline" className="border-red-200 text-red-700">Cancellato</Badge>}
                  {subscription.status === 'past_due' && <Badge variant="outline" className="border-orange-200 text-orange-700">In ritardo</Badge>}
                  {!subscription.status && <span className="text-gray-400">-</span>}
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Periodo Start</p>
                  <p className="text-gray-900">{subscription.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString('it-IT') : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Periodo End</p>
                  <p className="text-gray-900">{subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('it-IT') : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Trial End</p>
                  <p className="text-gray-900">{subscription.trial_end ? new Date(subscription.trial_end).toLocaleDateString('it-IT') : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Cancel at Period</p>
                  <p className="text-gray-900">{subscription.cancel_at_period_end ? 'Sì' : 'No'}</p>
                </div>
                <div className="flex items-end">
                  <Select onValueChange={(plan) => onManageSubscription(company.id, 'upgrade', plan)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Modifica piano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="builder">Builder</SelectItem>
                      <SelectItem value="hero">Hero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {companiesWithSubscriptions.length === 0 && (
        <p className="text-center text-gray-500 py-8">Nessun abbonamento trovato</p>
      )}
    </div>
  );
};

// Payments Table Component
const PaymentsTable = ({ payments, onVerify, onRefund, formatCurrency, formatDate, getStatusBadge }: any) => {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-semibold">ID Pagamento</TableHead>
            <TableHead className="font-semibold">Importo</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Stato</TableHead>
            <TableHead className="font-semibold">Data</TableHead>
            <TableHead className="text-right font-semibold pr-6">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                Nessun pagamento trovato
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment: any) => (
              <TableRow key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-mono text-sm">
                  {payment.stripe_payment_intent_id || payment.stripe_invoice_id || payment.id?.slice(0, 12)}...
                </TableCell>
                <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {payment.payment_type}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell className="text-gray-600 text-sm">{formatDate(payment.created_at)}</TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end space-x-2">
                    {payment.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onVerify(payment.id)}
                        className="hover:text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {payment.status === 'succeeded' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRefund(payment.id)}
                        className="hover:text-orange-600 hover:bg-orange-50"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminDashboard;
