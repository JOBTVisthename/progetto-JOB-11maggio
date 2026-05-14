import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Bell,
  Shield,
  Mail,
  Smartphone,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  FileText,
  AlertTriangle,
  MapPin,
  Phone as PhoneIcon,
  Link as LinkIcon,
  Briefcase,
  Users,
  Calendar,
  Video,
  Camera,
  Upload,
  X,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import CompanyLogoUpload from '@/components/company/CompanyLogoUpload';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    profile: companyProfile,
    loading: profileLoading,
    updating: profileUpdating,
    updateProfile,
    uploadLogo,
    removeLogo
  } = useCompanyProfile();

  // User type detection
  const [userType, setUserType] = useState<'candidate' | 'company' | null>(null);
  const [loadingUserType, setLoadingUserType] = useState(true);

  // Candidate profile state
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);

  // NOTIFICHE
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // AZIENDA FORM STATE
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyFoundedYear, setCompanyFoundedYear] = useState('');

  // CANDIDATO FORM STATE
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [candidateCity, setCandidateCity] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [desiredJobTitle, setDesiredJobTitle] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [availableStartDate, setAvailableStartDate] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [shiftWorkAvailability, setShiftWorkAvailability] = useState(false);
  const [weekendAvailability, setWeekendAvailability] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');

  // Candidate form state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        setLoadingUserType(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      if (data) {
        setUserType(data.user_type);
        if (data.user_type === 'candidate') {
          fetchCandidateProfile();
        }
      }
      setLoadingUserType(false);
    };
    fetchUserType();
  }, [user]);

  const fetchCandidateProfile = async () => {
    if (!user) return;
    setLoadingCandidate(true);
    try {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setCandidateProfile(data);

      // Set form values
      setFirstName(data?.first_name || '');
      setLastName(data?.last_name || '');
      setCandidateCity(data?.city || '');
      setCandidatePhone(data?.phone || '');
      setDesiredJobTitle(data?.desired_job_title || '');
      setBirthDate(data?.birth_date || '');
      setAvailableStartDate(data?.available_start_date || '');
      setWillingToRelocate(data?.willing_to_relocate || false);
      setShiftWorkAvailability(data?.shift_work_availability || false);
      setWeekendAvailability(data?.weekend_availability || false);
      setProfileImageUrl(data?.profile_image_url || '');
      setCvUrl(data?.cv_url || '');
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
    } finally {
      setLoadingCandidate(false);
    }
  };

  useEffect(() => {
    if (companyProfile) {
      setCompanyName(companyProfile.company_name || '');
      setCompanyDescription(companyProfile.description || '');
      setCompanyWebsite(companyProfile.website || '');
      setCompanyCity(companyProfile.city || '');
      setCompanyPhone(companyProfile.phone || '');
      setCompanyIndustry(companyProfile.industry || '');
      setCompanySize(companyProfile.company_size || '');
      setCompanyFoundedYear(companyProfile.founded_year?.toString() || '');
    }
  }, [companyProfile]);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Password validation
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengths = [
      { text: 'Molto debole', color: 'bg-red-500' },
      { text: 'Debole', color: 'bg-orange-500' },
      { text: 'Discreta', color: 'bg-yellow-500' },
      { text: 'Buona', color: 'bg-green-400' },
      { text: 'Fortissima', color: 'bg-green-600' }
    ];

    return strengths[Math.min(score, 4)];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const isPasswordValid = () => {
    if (!newPassword) return false;
    if (newPassword.length < 8) return false;
    if (!/[A-Z]/.test(newPassword)) return false;
    if (!/[a-z]/.test(newPassword)) return false;
    if (!/\d/.test(newPassword)) return false;
    if (newPassword !== confirmPassword) return false;
    return true;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast({
        title: "Password mancante",
        description: "Inserisci la tua password attuale",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid()) {
      toast({
        title: "Password non valida",
        description: "La nuova password deve avere almeno 8 caratteri, includere maiuscole, minuscole e numeri. Le password devono coincidere.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword === currentPassword) {
      toast({
        title: "Password identica",
        description: "La nuova password deve essere diversa da quella attuale",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: "Password errata",
          description: "La password attuale inserita non è corretta",
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Password aggiornata!",
        description: "La tua password è stata modificata con successo",
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il cambio password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveCandidate = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('candidate_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          city: candidateCity,
          phone: candidatePhone,
          desired_job_title: desiredJobTitle,
          birth_date: birthDate || null,
          available_start_date: availableStartDate || null,
          willing_to_relocate: willingToRelocate,
          shift_work_availability: shiftWorkAvailability,
          weekend_availability: weekendAvailability,
          profile_image_url: profileImageUrl,
          cv_url: cvUrl,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo",
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il profilo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('candidate-photos')
        .upload(fileName, file);

      if (uploadError) {
        // If file exists, delete and re-upload
        if (uploadError.message.includes('already exists')) {
          await supabase.storage.from('candidate-photos').remove([fileName]);
          const { error: retryError } = await supabase.storage
            .from('candidate-photos')
            .upload(fileName, file);
          if (retryError) throw retryError;
        } else {
          throw uploadError;
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('candidate-photos')
        .getPublicUrl(fileName);

      setProfileImageUrl(publicUrl);

      toast({
        title: "Foto caricata",
        description: "La tua foto profilo è stata aggiornata",
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile caricare la foto",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImageUrl('');
    toast({
      title: "Foto rimossa",
      description: "La tua foto profilo è stata rimossa",
    });
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.error('No file or user:', { file: !!file, user: !!user });
      return;
    }

    console.log('User ID:', user.id);

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato non supportato",
        description: "Carica un file PDF o Word",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "Il file non deve superare i 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingCv(true);
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}_cv.${fileExt}`;

      console.log('Uploading CV with fileName:', fileName);

      // Delete old CV if exists - handle both old URL format and new filename format
      if (cvUrl) {
        let oldFileName = cvUrl;
        let oldBucket = 'candidate-cvs';

        console.log('Removing old CV:', cvUrl);

        if (cvUrl.startsWith('http')) {
          // Full URL format - extract bucket and filename
          if (cvUrl.includes('/curriculum_files/')) {
            oldBucket = 'curriculum_files';
            const parts = cvUrl.split('/curriculum_files/');
            if (parts.length > 1) {
              oldFileName = parts[1].split('/')[0] + '/' + parts[1].split('/')[1];
            }
          } else if (cvUrl.includes('/candidate-cvs/')) {
            const parts = cvUrl.split('/candidate-cvs/');
            if (parts.length > 1) {
              oldFileName = parts[1];
            }
          }
        }

        console.log('Old file details:', { oldBucket, oldFileName });

        try {
          await supabase.storage.from(oldBucket).remove([oldFileName]);
          console.log('Old CV removed successfully');
        } catch (err) {
          console.log('Old file not found or already deleted:', err);
        }
      }

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('candidate-cvs')
        .upload(fileName, file);

      console.log('Upload result:', { uploadError, uploadData });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // If file exists, delete and re-upload
        if (uploadError.message.includes('already exists')) {
          await supabase.storage.from('candidate-cvs').remove([fileName]);
          const { error: retryError } = await supabase.storage
            .from('candidate-cvs')
            .upload(fileName, file);
          if (retryError) throw retryError;
        } else {
          throw uploadError;
        }
      }

      // Store only the filename (not full URL)
      setCvUrl(fileName);

      toast({
        title: "CV caricato",
        description: "Il tuo CV è stato caricato con successo",
      });
    } catch (error: any) {
      console.error('Error uploading CV:', error);
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
    if (!user || !cvUrl) {
      console.error('No user or cvUrl:', { user: !!user, cvUrl });
      return;
    }

    console.log('Removing CV:', cvUrl);

    try {
      let fileName = cvUrl;
      const bucketName = 'candidate-cvs';

      // Handle different URL formats
      if (cvUrl.startsWith('http')) {
        if (cvUrl.includes('/candidate-cvs/')) {
          const parts = cvUrl.split('/candidate-cvs/');
          if (parts.length > 1) {
            fileName = parts[1];
          }
        }
      } else if (cvUrl.includes('/')) {
        // Just filename with path
        fileName = cvUrl;
      }

      console.log('Remove details:', { bucketName, fileName });

      const { error } = await supabase.storage.from(bucketName).remove([fileName]);

      if (error) {
        console.error('Remove error:', error);
        throw error;
      }

      console.log('CV removed successfully');
      setCvUrl('');
      toast({
        title: "CV rimosso",
        description: "Il tuo CV è stato rimosso con successo",
      });
    } catch (error: any) {
      console.error('Error removing CV:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile rimuovere il CV",
        variant: "destructive",
      });
    }
  };

  const handleViewCv = async () => {
    if (!cvUrl || !user) return;

    try {
      // If cvUrl is already a full URL, open it directly
      if (cvUrl.startsWith('http')) {
        window.open(cvUrl, '_blank');
        return;
      }

      // Otherwise, generate signed URL from candidate-cvs bucket
      const { data, error } = await supabase.storage
        .from('candidate-cvs')
        .createSignedUrl(cvUrl, 60); // 1 minute expiry

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      } else {
        throw new Error('Impossibile generare l\'URL firmato');
      }
    } catch (error: any) {
      console.error('Error viewing CV:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile visualizzare il CV",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (userType === 'candidate') {
      await handleSaveCandidate();
    } else if (userType === 'company') {
      const result = await updateProfile({
        company_name: companyName,
        description: companyDescription,
        website: companyWebsite,
        city: companyCity,
        phone: companyPhone,
        industry: companyIndustry,
        company_size: companySize,
        founded_year: companyFoundedYear ? parseInt(companyFoundedYear) : null,
        logo_url: companyProfile?.logo_url, // Mantiene il logo esistente se non modificato
      });

      if (!result.success) {
        return;
      }
    }

    toast({
      title: "Impostazioni salvate",
      description: "Le tue preferenze sono state aggiornate",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Esportazione in corso",
      description: "Riceverai un'email con i tuoi dati",
    });
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINA') {
      toast({
        title: "Conferma non valida",
        description: "Digita ESATTAMENTE 'ELIMINA' per confermare",
        variant: "destructive",
      });
      return;
    }

    setIsDeletingAccount(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user?.id || '');

      if (deleteError) {
        throw deleteError;
      }

      await supabase.auth.signOut();

      toast({
        title: "Account eliminato",
        description: "Il tuo account è stato eliminato permanentemente",
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile eliminare l'account. Contatta il supporto.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5">
      <Header />

      <main className="section-padding">
        <div className="container container-padding max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-jobtv-teal to-jobtv-blue bg-clip-text text-transparent">
              Impostazioni
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gestisci il tuo account, privacy e preferenze personalizzate
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full mb-8 ${userType === 'candidate' ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-4'}`}>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profilo</span>
              </TabsTrigger>
              {userType === 'candidate' && (
                <TabsTrigger value="video" className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>Video Intervista</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifiche</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Sicurezza</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Privacy</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {loadingUserType ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-jobtv-teal" />
                </div>
              ) : userType === 'company' ? (
                <>
                  {/* Company Profile Card */}
                  <Card className="border-jobtv-blue/20 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-jobtv-blue/10 to-jobtv-teal/10">
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="w-5 h-5 text-jobtv-blue" />
                        <span>Profilo Azienda</span>
                      </CardTitle>
                      <CardDescription>
                        Gestisci le informazioni della tua azienda
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <CompanyLogoUpload
                        currentLogo={companyProfile?.logo_url || null}
                        onUpload={uploadLogo}
                        onRemove={removeLogo}
                        uploading={profileUpdating}
                      />

                      <div className="space-y-2">
                        <Label htmlFor="companyName">Nome Azienda *</Label>
                        <Input
                          id="companyName"
                          placeholder="La tua azienda"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="border-jobtv-blue/30 focus:border-jobtv-blue"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrizione</Label>
                        <Textarea
                          id="description"
                          placeholder="Descrivi brevemente la tua azienda..."
                          rows={3}
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          className="border-jobtv-blue/30 focus:border-jobtv-blue"
                        />
                        <p className="text-xs text-gray-500">
                          {companyDescription?.length || 0}/500 caratteri
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Sito Web</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="website"
                            placeholder="https://www.tuaazienda.it"
                            className="pl-10 border-jobtv-blue/30 focus:border-jobtv-blue"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Città *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="city"
                              placeholder="Milano"
                              className="pl-10 border-jobtv-blue/30 focus:border-jobtv-blue"
                              value={companyCity}
                              onChange={(e) => setCompanyCity(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefono *</Label>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+39 333 1234567"
                              className="pl-10 border-jobtv-blue/30 focus:border-jobtv-blue"
                              value={companyPhone}
                              onChange={(e) => setCompanyPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">Settore</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            id="industry"
                            className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-jobtv-blue bg-white"
                            value={companyIndustry}
                            onChange={(e) => setCompanyIndustry(e.target.value)}
                          >
                            <option value="">Seleziona settore</option>
                            <option value="tech">Tecnologia / Software</option>
                            <option value="finance">Finanza / Banking</option>
                            <option value="healthcare">Sanità / Pharma</option>
                            <option value="retail">Retail / E-commerce</option>
                            <option value="manufacturing">Manufacturing / Industria</option>
                            <option value="consulting">Consulenza</option>
                            <option value="marketing">Marketing / Comunicazione</option>
                            <option value="education">Formazione / Educazione</option>
                            <option value="other">Altro</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companySize">Dimensioni Azienda</Label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                              id="companySize"
                              className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-jobtv-blue bg-white"
                              value={companySize}
                              onChange={(e) => setCompanySize(e.target.value)}
                            >
                              <option value="">Seleziona dimensione</option>
                              <option value="1-10">1-10 dipendenti</option>
                              <option value="11-50">11-50 dipendenti</option>
                              <option value="51-200">51-200 dipendenti</option>
                              <option value="201-500">201-500 dipendenti</option>
                              <option value="501-1000">501-1000 dipendenti</option>
                              <option value="1000+">Più di 1000 dipendenti</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foundedYear">Anno di Fondazione</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="foundedYear"
                              type="number"
                              placeholder="es. 2010"
                              min="1800"
                              max={new Date().getFullYear()}
                              className="pl-10 border-jobtv-blue/30 focus:border-jobtv-blue"
                              value={companyFoundedYear}
                              onChange={(e) => setCompanyFoundedYear(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user?.email}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">L'email non può essere modificata</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : userType === 'candidate' ? (
                <>
                  {/* Candidate Profile Card */}
                  {loadingCandidate ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-jobtv-teal" />
                    </div>
                  ) : (
                    <Card className="border-jobtv-teal/20 shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                        <CardTitle className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-jobtv-teal" />
                          <span>Profilo Candidato</span>
                        </CardTitle>
                        <CardDescription>
                          Aggiorna le informazioni del tuo profilo
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        {/* Profile Photo Upload */}
                        <div className="space-y-4">
                          <Label>Foto Profilo</Label>
                          <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-jobtv-teal/20 to-jobtv-green/20 border-2 border-jobtv-teal/30 flex items-center justify-center overflow-hidden">
                              {profileImageUrl ? (
                                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-12 h-12 text-jobtv-teal/50" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex gap-2">
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePhotoUpload}
                                    className="hidden"
                                    disabled={uploadingPhoto}
                                  />
                                  <Button variant="outline" size="sm" disabled={uploadingPhoto} as="span">
                                    {uploadingPhoto ? (
                                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Caricamento...</>
                                    ) : (
                                      <><Camera className="w-4 h-4 mr-2" /> Carica Foto</>
                                    )}
                                  </Button>
                                </label>
                                {profileImageUrl && (
                                  <Button variant="outline" size="sm" onClick={handleRemovePhoto}>
                                    <X className="w-4 h-4 mr-2" /> Rimuovi
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">JPG, PNG o GIF. Max 5MB</p>
                            </div>
                          </div>
                        </div>

                        {/* CV Upload */}
                        <div className="space-y-4">
                          <Label>Curriculum Vitae (CV)</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {cvUrl ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded bg-jobtv-teal/10 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-jobtv-teal" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">CV caricato</p>
                                    <p className="text-xs text-gray-500">
                                      {cvUrl.includes('/') ? cvUrl.split('/').pop()?.replace(/^\d+_cv_/, '') : cvUrl}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={handleViewCv}>
                                    <Download className="w-4 h-4 mr-2" /> Visualizza
                                  </Button>
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx"
                                      onChange={handleCvUpload}
                                      className="hidden"
                                      disabled={uploadingCv}
                                    />
                                    <Button variant="outline" size="sm" disabled={uploadingCv} as="span">
                                      {uploadingCv ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sostituzione...</>
                                      ) : (
                                        <><Upload className="w-4 h-4 mr-2" /> Sostituisci CV</>
                                      )}
                                    </Button>
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 mb-3">Carica il tuo CV in formato PDF o Word</p>
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleCvUpload}
                                    className="hidden"
                                    disabled={uploadingCv}
                                  />
                                  <Button variant="outline" size="sm" disabled={uploadingCv} as="span">
                                    {uploadingCv ? (
                                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Caricamento...</>
                                    ) : (
                                      <><Upload className="w-4 h-4 mr-2" /> Carica CV</>
                                    )}
                                  </Button>
                                </label>
                                <p className="text-xs text-gray-500 mt-2">PDF, DOC o DOCX. Max 5MB</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Nome *</Label>
                            <Input
                              id="firstName"
                              placeholder="Mario"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="border-jobtv-teal/30 focus:border-jobtv-teal"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Cognome *</Label>
                            <Input
                              id="lastName"
                              placeholder="Rossi"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="border-jobtv-teal/30 focus:border-jobtv-teal"
                            />
                          </div>
                        </div>

                        {/* Email (read-only) */}
                        <div className="space-y-2">
                          <Label htmlFor="candidateEmail">Email</Label>
                          <Input
                            id="candidateEmail"
                            type="email"
                            defaultValue={user?.email}
                            disabled
                            className="bg-gray-50"
                          />
                          <p className="text-xs text-gray-500">L'email non può essere modificata</p>
                        </div>

                        {/* City and Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="candidateCity">Città *</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                              <Input
                                id="candidateCity"
                                placeholder="Milano"
                                className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal"
                                value={candidateCity}
                                onChange={(e) => setCandidateCity(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="candidatePhone">Telefono *</Label>
                            <div className="relative">
                              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jobtv-teal" />
                              <Input
                                id="candidatePhone"
                                type="tel"
                                placeholder="+39 333 1234567"
                                className="pl-10 border-jobtv-teal/30 focus:border-jobtv-teal"
                                value={candidatePhone}
                                onChange={(e) => setCandidatePhone(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Desired Job Title */}
                        <div className="space-y-2">
                          <Label htmlFor="desiredJobTitle">Titolo Lavoro Desiderato</Label>
                          <Input
                            id="desiredJobTitle"
                            placeholder="es. Sviluppatore Frontend, Project Manager..."
                            value={desiredJobTitle}
                            onChange={(e) => setDesiredJobTitle(e.target.value)}
                            className="border-jobtv-teal/30 focus:border-jobtv-teal"
                          />
                        </div>

                        {/* Birth Date */}
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Data di Nascita</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="border-jobtv-teal/30 focus:border-jobtv-teal"
                          />
                        </div>

                        {/* Availability */}
                        <div className="space-y-2">
                          <Label htmlFor="availableStartDate">Disponibile dal</Label>
                          <Input
                            id="availableStartDate"
                            type="date"
                            value={availableStartDate}
                            onChange={(e) => setAvailableStartDate(e.target.value)}
                            className="border-jobtv-teal/30 focus:border-jobtv-teal"
                          />
                        </div>

                        {/* Boolean Preferences */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">Disponibile a Trasferirsi</div>
                              <div className="text-sm text-gray-500">Sei disposto a spostarti per il lavoro giusto?</div>
                            </div>
                            <Switch
                              checked={willingToRelocate}
                              onCheckedChange={setWillingToRelocate}
                              className="data-[state=checked]:bg-jobtv-teal"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">Disponibilità su Turni</div>
                              <div className="text-sm text-gray-500">Sei disponibile per lavori su turni?</div>
                            </div>
                            <Switch
                              checked={shiftWorkAvailability}
                              onCheckedChange={setShiftWorkAvailability}
                              className="data-[state=checked]:bg-jobtv-teal"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">Disponibilità Weekend</div>
                              <div className="text-sm text-gray-500">Sei disponibile a lavorare nei weekend?</div>
                            </div>
                            <Switch
                              checked={weekendAvailability}
                              onCheckedChange={setWeekendAvailability}
                              className="data-[state=checked]:bg-jobtv-teal"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-jobtv-teal" />
                    <span>Preferenze Lingua</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Lingua</Label>
                    <select id="language" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal">
                      <option value="it">Italiano</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Orario</Label>
                    <select id="timezone" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal">
                      <option value="Europe/Rome">Europe/Rome (UTC+1)</option>
                      <option value="Europe/London">Europe/London (UTC+0)</option>
                      <option value="America/New_York">America/New_York (UTC-5)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Video Interview Tab - CANDIDATES ONLY */}
            {userType === 'candidate' && (
              <TabsContent value="video" className="space-y-6">
                <Card className="border-jobtv-teal/20 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-jobtv-teal/10 to-jobtv-green/10">
                    <CardTitle className="flex items-center space-x-2">
                      <Video className="w-5 h-5 text-jobtv-teal" />
                      <span>Video Intervista</span>
                    </CardTitle>
                    <CardDescription>
                      Crea e gestisci le tue video interviste per farti notare dalle aziende
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="text-center py-8 bg-jobtv-teal/5 rounded-lg border-2 border-dashed border-jobtv-teal/30">
                      <Video className="w-16 h-16 mx-auto text-jobtv-teal/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Crea la tua Video Intervista</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Registra una presentazione video o carica un video esistente per mostrare alle aziende chi sei
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => navigate('/record-interview')}
                          className="bg-gradient-to-r from-jobtv-teal to-jobtv-green hover:opacity-90"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Registra Nuova Intervista
                        </Button>
                        <Button
                          onClick={() => navigate('/video-interview')}
                          variant="outline"
                          className="border-jobtv-teal text-jobtv-teal hover:bg-jobtv-teal/10"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Gestisci Video Interviste
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Consigli per una buona video intervista</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-jobtv-teal mt-0.5 flex-shrink-0" />
                          <span>Scegli un luogo ben illuminato e silenzioso</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-jobtv-teal mt-0.5 flex-shrink-0" />
                          <span>Indossa un abbigliamento professionale</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-jobtv-teal mt-0.5 flex-shrink-0" />
                          <span>Parla in modo chiaro e conciso (2-3 minuti max)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-jobtv-teal mt-0.5 flex-shrink-0" />
                          <span>Presenta: chi sei, le tue competenze, cosa cerchi</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-jobtv-teal" />
                    <span>Impostazioni Notifiche</span>
                  </CardTitle>
                  <CardDescription>
                    Scegli come e quando vuoi ricevere notifiche
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-gray-500">Ricevi aggiornamenti via email</div>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      className="data-[state=checked]:bg-jobtv-teal"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-gray-500">Notifiche sul dispositivo</div>
                      </div>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      className="data-[state=checked]:bg-jobtv-teal"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Tipi di Notifiche</h4>
                    <div className="space-y-3">
                      {[
                        'Nuovi messaggi',
                        'Proposte di lavoro',
                        'Aggiornamenti profilo',
                        'Newsletter settimanale'
                      ].map((type, index) => (
                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" defaultChecked={index < 3} className="w-4 h-4 text-jobtv-teal" />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-jobtv-teal" />
                    <span>Cambia Password</span>
                  </CardTitle>
                  <CardDescription>
                    Aggiorna la tua password per mantenere il tuo account sicuro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Password Attuale *</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Inserisci la tua password attuale"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nuova Password *</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Inserisci la nuova password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{passwordStrength.text}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Conferma Nuova Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Conferma la nuova password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {confirmPassword && (
                        <div className={`flex items-center text-sm ${confirmPassword === newPassword ? 'text-green-600' : 'text-red-600'}`}>
                          {confirmPassword === newPassword ? (
                            <><CheckCircle className="w-4 h-4 mr-1" /> Le password coincidono</>
                          ) : (
                            <><AlertCircle className="w-4 h-4 mr-1" /> Le password non coincidono</>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-jobtv-gradient"
                      disabled={isChangingPassword || !currentPassword || !isPasswordValid()}
                    >
                      {isChangingPassword ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aggiornamento in corso...</>
                      ) : (
                        <><Shield className="mr-2 h-4 w-4" /> Aggiorna Password</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-gradient-to-br from-jobtv-teal/5 to-jobtv-blue/5 border-jobtv-teal/20">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-5 h-5 text-jobtv-teal mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Job TV S.r.l.</div>
                        <div className="text-sm text-gray-600">Via G. Mazzini 3/C, 20063 Cernusco sul Naviglio (MI)</div>
                        <div className="text-sm text-gray-600">P.IVA / Codice fiscale: 14375330967</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-jobtv-teal mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Contatti Privacy</div>
                        <div className="text-sm text-gray-600">privacy@jobtv.it</div>
                        <div className="text-sm text-gray-600">dpo@jobtv.it (DPO)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-jobtv-teal" />
                    <span>Gestione Dati Personali</span>
                  </CardTitle>
                  <CardDescription>
                    Controlla come i tuoi dati vengono utilizzati
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Esporta i Tuoi Dati
                    </h4>
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="w-full md:w-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Richiedi Esportazione Dati
                    </Button>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Elimina Account
                    </h4>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <AlertTriangle className="w-5 h-5 text-red-600 mb-2" />
                      <p className="text-gray-700 mb-3">
                        <strong>Attenzione:</strong> L'eliminazione dell'account è <strong>permanente e irreversibile</strong>.
                      </p>
                      <Button
                        onClick={handleDeleteAccount}
                        variant="destructive"
                        className="w-full md:w-auto"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Elimina il Mio Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          {activeTab !== 'security' && activeTab !== 'privacy' && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleSave}
                size="lg"
                disabled={saving}
                className="bg-jobtv-gradient hover:opacity-90 px-8 py-4"
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvataggio...</>
                ) : (
                  <><Save className="mr-2 h-5 w-5" /> Salva Impostazioni</>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Elimina Account Definitivamente
            </DialogTitle>
            <DialogDescription className="text-gray-700 pt-2">
              Questa azione è <strong>permanente e irreversibile</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">Verranno eliminati:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Profilo e informazioni personali</li>
                <li>• Video CV e interviste registrate</li>
                <li>• Storico conversazioni e match</li>
                <li>• Preferenze e impostazioni</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation">
                Per confermare, digita <span className="font-bold">ELIMINA</span>:
              </Label>
              <Input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Digita ELIMINA"
                className="uppercase"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation('');
              }}
              disabled={isDeletingAccount}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAccount}
              disabled={deleteConfirmation !== 'ELIMINA' || isDeletingAccount}
            >
              {isDeletingAccount ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminazione...</>
              ) : (
                <><Trash2 className="mr-2 h-4 w-4" /> Elimina Account</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
