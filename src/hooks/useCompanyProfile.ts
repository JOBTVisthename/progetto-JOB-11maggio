import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CompanyProfile {
  id: string;
  company_name: string | null;
  city: string | null;
  phone: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  founded_year: number | null;
  updated_at?: string;
}

export const useCompanyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch company profile
  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching company profile:', error);
      // Don't show toast for initial fetch - might not have profile yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Update company profile
  const updateProfile = async (updates: Partial<CompanyProfile>) => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Utente non autenticato",
        variant: "destructive",
      });
      return { success: false };
    }

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('company_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      toast({
        title: "Profilo aggiornato",
        description: "Le informazioni sono state salvate con successo",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating company profile:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setUpdating(false);
    }
  };

  // Upload company logo
  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Utente non autenticato",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato non valido",
        description: "Sono ammessi solo JPG, PNG, WEBP e GIF",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "Il logo non può superare i 5MB",
        variant: "destructive",
      });
      return null;
    }

    setUpdating(true);

    try {
      // Delete old logo if exists
      if (profile?.logo_url) {
        const oldPath = profile.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('company-logos')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new logo
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile with new logo URL
      await updateProfile({ logo_url: publicUrl });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile caricare il logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUpdating(false);
    }
  };

  // Remove logo
  const removeLogo = async () => {
    if (!user || !profile?.logo_url) {
      return { success: false };
    }

    setUpdating(true);

    try {
      // Delete file from storage
      const oldPath = profile.logo_url.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('company-logos')
          .remove([`${user.id}/${oldPath}`]);
      }

      // Update profile
      await updateProfile({ logo_url: null });

      return { success: true };
    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile rimuovere il logo",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    updating,
    fetchProfile,
    updateProfile,
    uploadLogo,
    removeLogo,
  };
};
