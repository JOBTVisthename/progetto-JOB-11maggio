import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, MessageCircle } from 'lucide-react';

export const triggerChatWithRole = (role: 'candidate' | 'company') => {
  window.dispatchEvent(new CustomEvent('open-jobtv-chat', { detail: { role } }));
};

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, full_name, company_name, user_type, profile_image_url')
          .eq('id', user.id)
          .single();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching header profile:", error);
      }
    };
    getProfile();
  }, [user]);

  const displayName = profile?.user_type === 'company' 
    ? (profile.company_name || profile.full_name || 'Azienda') 
    : profile?.first_name 
      ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
      : (profile?.full_name || user?.email?.split('@')[0] || 'Utente');

  const navLinks = [
    { name: 'CANDIDATI', path: '/for-candidates' },
    { name: 'AZIENDE', path: '/for-companies' },
    { name: 'PREZZI', path: '/pricing-plans' },
    { name: 'SUPPORTO', path: '/help' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-md transition-all duration-300">
      <div className="container mx-auto px-4 h-28 flex items-center justify-between">
        {/* Logo - Aumentato del 100% */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="bg-jobtv-gradient p-2.5 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img 
              src="/logo.png" 
              alt="JobTV Logo" 
              className="h-20 w-auto object-contain" 
              onError={(e) => (e.currentTarget.style.display = 'none')} 
            />
            <span className="text-white font-black text-4xl leading-none">J</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black bg-jobtv-gradient bg-clip-text text-transparent leading-none">
              JobTV
            </span>
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] mt-1 hidden sm:block uppercase">Video Recruiting</span>
          </div>
        </Link>

        {/* Menu Navigazione Pagine */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-xs font-black tracking-widest transition-all duration-200 hover:text-jobtv-teal ${location.pathname === link.path ? 'text-jobtv-teal border-b-2 border-jobtv-teal pb-1' : 'text-gray-500'}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Info Candidato / Azienda e Avatar */}
        <div className="flex items-center gap-4">
          {!user && (
            <div className="hidden xl:flex items-center gap-3 mr-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-jobtv-blue font-bold hover:text-jobtv-teal"
                onClick={() => triggerChatWithRole('candidate')}
              >
                Chat Candidato
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-jobtv-blue font-bold hover:text-jobtv-teal"
                onClick={() => triggerChatWithRole('company')}
              >
                Chat Azienda
              </Button>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-4 pl-8 border-l border-gray-100">
              <div className="text-right hidden md:block">
                <p className="text-base font-black text-gray-900 leading-tight uppercase tracking-tight">{displayName}</p>
                <p className="text-[9px] font-black text-jobtv-teal uppercase tracking-[0.2em] mt-0.5">{profile?.user_type === 'company' ? 'Azienda Premium' : 'Candidato PRO'}</p>
              </div>
              <Link to={profile?.user_type === 'company' ? '/company/dashboard' : '/dashboard'} className="relative group">
                <Avatar className="h-16 w-16 border-4 border-white shadow-xl group-hover:shadow-jobtv-blue/20 transition-all duration-300 group-hover:scale-105">
                  <AvatarImage src={profile?.profile_image_url} />
                  <AvatarFallback className="bg-jobtv-gradient text-white font-black text-xl shadow-inner">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full" />
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-gray-400 hover:text-red-500 transition-colors ml-2">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="font-black text-xs tracking-widest text-gray-600 hover:text-jobtv-blue">
                <Link to="/login">ACCEDI</Link>
              </Button>
              <Button asChild className="bg-jobtv-gradient font-black text-xs tracking-widest shadow-xl px-8 h-12 rounded-xl hover:scale-105 transition-all">
                <Link to="/register">REGISTRATI</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;