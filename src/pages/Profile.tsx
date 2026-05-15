import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Calendar, Edit, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import PageLayout from "@/components/layout/PageLayout";

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile({ ...data, email: user.email });
      } catch (error) {
        console.error('Errore nel caricamento del profilo:', error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jobtv-blue" />
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 p-0 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" /> Torna indietro
            </Button>
            <h1 className="text-3xl font-bold">Il Mio Profilo</h1>
          </div>
          <Button onClick={() => navigate('/settings')} className="bg-jobtv-gradient flex items-center gap-2">
            <Edit className="h-4 w-4" /> Modifica Profilo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar con Info Rapide */}
          <Card className="md:col-span-1 border-jobtv-blue/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-jobtv-blue/10 rounded-full flex items-center justify-center mb-4 border-2 border-jobtv-blue/20">
                  <User className="h-12 w-12 text-jobtv-blue" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Utente JobTV'}</h2>
                <p className="text-jobtv-teal font-medium text-sm mb-4">@{profile?.username || 'username'}</p>
                <div className="w-full pt-4 border-t border-gray-100 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-jobtv-blue" /> {profile?.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-jobtv-blue" /> Membro dal: {profile ? new Date(profile.created_at).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenuto Principale */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-jobtv-blue/10">
              <CardHeader>
                <CardTitle className="text-lg">Riepilogo Account</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome Completo</p>
                  <p className="text-gray-900 font-medium">{profile?.full_name || 'Non impostato'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo di Account</p>
                  <p className="text-gray-900 font-medium capitalize">{profile?.user_type || 'Candidato'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-jobtv-blue/10 bg-gray-50/50">
              <CardContent className="py-10 text-center">
                <p className="text-gray-500 italic text-sm">Le tue video interviste e i match appariranno qui una volta completato il profilo.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;