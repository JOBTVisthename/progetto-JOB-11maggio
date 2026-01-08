import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin';
import { Users, Building, CreditCard, LogOut, Edit, Trash2, Eye, Plus, Key, ToggleLeft, ToggleRight, Loader2, ChevronLeft, ChevronRight, Search, Crown } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { ResetPasswordDialog } from '@/components/admin/ResetPasswordDialog';
import { useToast } from '@/hooks/use-toast';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row'];
type CompanyProfile = Database['public']['Tables']['company_profiles']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface UserWithProfile extends UserProfile {
  candidate_profiles?: CandidateProfile | null;
  company_profiles?: CompanyProfile | null;
  subscriptions?: Subscription[] | Subscription | null;
  email?: string;
}

const AdminDashboard = () => {
  const { isAdmin, user: adminUser, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (!isAdmin && !loading) {
      navigate('/admin/login');
      return;
    }
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, loading, navigate]);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      // Use the Edge Function proxy to bypass RLS and broken frontend keys
      const { data, error } = await supabase.functions.invoke('admin-task-proxy', {
        body: { action: 'get_users' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setUsers(data.users as UserWithProfile[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Errore nel caricamento",
        description: error.message || "Impossibile caricare gli utenti. Verifica la connessione.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === adminUser?.id) {
      toast({
        title: "Azione non consentita",
        description: "Non puoi eliminare te stesso.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Sei sicuro di voler eliminare questo utente? Questa azione è irreversibile.')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-task-proxy', {
        body: { action: 'delete_user', payload: { userId } }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Utente eliminato",
        description: "L'utente e tutti i dati associati sono stati rimossi.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Errore di eliminazione",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (newRole === 'admin' && !confirm('Sei sicuro di voler rendere questo utente amministratore?')) {
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-task-proxy', {
        body: { action: 'update_role', payload: { userId, role: newRole } }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast({
        title: "Ruolo aggiornato",
        description: `L'utente è ora un ${newRole}.`,
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = async (user: any) => {
    setSelectedUser(user);
    setSubscriptionDialogOpen(true);
  };

  const handleUpdateSubscription = async (userId: string, planType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-task-proxy', {
        body: { action: 'update_subscription', payload: { userId, planType } }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast({
        title: "Abbonamento aggiornato",
        description: `L'abbonamento è stato aggiornato a ${planType}.`,
      });
      
      setSubscriptionDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare l'abbonamento",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const openEditDialog = (user: any) => {
    setSelectedUser({
      ...user,
      full_name: user.user_type === 'candidate'
        ? `${user.candidate_profiles?.first_name || ''} ${user.candidate_profiles?.last_name || ''}`.trim()
        : user.company_profiles?.company_name || 'N/A'
    });
    setEditDialogOpen(true);
  };

  const openResetDialog = (user: any) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jobtv-blue" />
      </div>
    );
  }

  const candidates = users.filter(u => u.user_type === 'candidate');
  const companies = users.filter(u => u.user_type === 'company');
  const totalSubscriptions = users.filter(u =>
    Array.isArray(u.subscriptions) ? u.subscriptions.length > 0 : !!u.subscriptions
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="bg-jobtv-gradient p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser?.email}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 border-gray-200">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Utenti Totali", value: users.length, icon: Users, color: "text-blue-600" },
            { title: "Candidati", value: candidates.length, icon: Users, color: "text-teal-600" },
            { title: "Aziende", value: companies.length, icon: Building, color: "text-purple-600" },
            { title: "Abbonamenti", value: totalSubscriptions, icon: CreditCard, color: "text-orange-600" },
          ].map((stat, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              className="bg-jobtv-gradient"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Utente
            </Button>
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Aggiorna
            </Button>
          </div>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-6">
            <div>
              <CardTitle>Gestione Utenti</CardTitle>
              <CardDescription>Visualizza e gestisci tutti gli utenti del sistema</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Cerca per nome, email o ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full" onValueChange={() => setCurrentPage(1)}>
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Tutti ({users.length})
                </TabsTrigger>
                <TabsTrigger value="candidates" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Candidati ({candidates.length})
                </TabsTrigger>
                <TabsTrigger value="companies" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Aziende ({companies.length})
                </TabsTrigger>
              </TabsList>

              {['all', 'candidates', 'companies'].map((tab) => {
                const filteredByTab = tab === 'all' ? users : (tab === 'candidates' ? candidates : companies);
                const filteredBySearch = filteredByTab.filter(user => {
                  const name = (user.user_type === 'candidate'
                    ? `${user.candidate_profiles?.first_name || ''} ${user.candidate_profiles?.last_name || ''}`
                    : user.company_profiles?.company_name || '').toLowerCase();
                  const email = (user.email || '').toLowerCase();
                  const id = (user.id || '').toLowerCase();
                  const search = searchTerm.toLowerCase();
                  return name.includes(search) || email.includes(search) || id.includes(search);
                });

                const totalPages = Math.ceil(filteredBySearch.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedUsers = filteredBySearch.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <UserTable
                      users={paginatedUsers}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteUser}
                      onResetPassword={openResetDialog}
                      onToggleRole={handleToggleRole}
                    />

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between py-4 border-t border-gray-100 px-2 mt-4">
                        <div className="text-sm text-gray-500">
                          Mostrando <span className="font-medium text-gray-900">{startIndex + 1}</span>-
                          <span className="font-medium text-gray-900">{Math.min(startIndex + itemsPerPage, filteredBySearch.length)}</span> di
                          <span className="font-medium text-gray-900"> {filteredBySearch.length}</span> utenti
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentPage(prev => Math.max(1, prev - 1));
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            disabled={currentPage === 1}
                            className="h-8"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prec
                          </Button>
                          <div className="flex items-center px-2 text-xs font-medium text-gray-600">
                            {currentPage} / {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentPage(prev => Math.min(totalPages, prev + 1));
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            disabled={currentPage === totalPages}
                            className="h-8"
                          >
                            Succ <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchUsers}
      />
      {editDialogOpen && (
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}
      {resetDialogOpen && (
        <ResetPasswordDialog
          open={resetDialogOpen}
          onOpenChange={setResetDialogOpen}
          user={selectedUser}
        />
      )}
      
      {subscriptionDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSubscriptionDialogOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Gestisci Abbonamento
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setSubscriptionDialogOpen(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Utente: <span className="font-medium text-gray-900">
                    {selectedUser.user_type === 'candidate'
                      ? `${selectedUser.candidate_profiles?.first_name || ''} ${selectedUser.candidate_profiles?.last_name || ''}`.trim()
                      : selectedUser.company_profiles?.company_name || 'N/A'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Email: <span className="font-medium text-gray-900">{selectedUser.email}</span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Piano Abbonamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['starter', 'builder', 'hero'].map((plan) => (
                    <Button
                      key={plan}
                      variant={
                        (selectedUser.subscriptions?.plan_type ||
                         (Array.isArray(selectedUser.subscriptions) ? selectedUser.subscriptions[0]?.plan_type : null)) === plan
                          ? 'default'
                          : 'outline'
                      }
                      className="capitalize"
                      onClick={() => handleUpdateSubscription(selectedUser.id, plan)}
                    >
                      {plan}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Questa azione aggiornerà il piano abbonamento dell'azienda. L'azienda potrà visualizzare i profili dei candidati indipendentemente dal piano abbonamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface UserTableProps {
  users: UserWithProfile[];
  onDelete: (userId: string) => void;
  onToggleRole: (userId: string, currentRole: string) => void;
  onEdit: (user: any) => void;
  onResetPassword: (user: any) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete, onToggleRole, onEdit, onResetPassword }) => {
  const getUserName = (user: UserWithProfile) => {
    if (user.user_type === 'candidate' && user.candidate_profiles) {
      return `${user.candidate_profiles.first_name || ''} ${user.candidate_profiles.last_name || ''}`.trim() || 'N/A';
    }
    if (user.user_type === 'company' && user.company_profiles) {
      return user.company_profiles.company_name || 'N/A';
    }
    return 'N/A';
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
            <TableHead className="font-semibold">Ruolo</TableHead>
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
            users.map((user) => (
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
                      <div className="text-xs text-gray-500 font-mono truncate max-w-[120px]">{user.id}</div>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() => onToggleRole(user.id, user.role || 'user')}
                  >
                    <Badge
                      variant={user.role === 'admin' ? 'destructive' : 'outline'}
                      className="cursor-pointer flex gap-1 items-center"
                    >
                      {user.role === 'admin' ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                      {user.role || 'user'}
                    </Badge>
                  </Button>
                </TableCell>
                <TableCell>
                  {user.subscriptions ? (
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 capitalize">
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
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => onEdit(user)}
                      title="Modifica"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-amber-600 hover:bg-amber-50"
                      onClick={() => onResetPassword(user)}
                      title="Resetta Password"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(user.id)}
                      title="Elimina"
                    >
                      <Trash2 className="h-4 w-4" />
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
