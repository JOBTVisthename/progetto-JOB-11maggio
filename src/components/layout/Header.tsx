import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Building2, LogIn } from 'lucide-react';

const Header: React.FC = () => {
  const triggerChatWithRole = (role: 'candidate' | 'company') => {
    window.dispatchEvent(new CustomEvent('open-jobtv-chat', { detail: { role } }));
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm py-4 sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo - Increased size by 100% */}
        <Link to="/" className="flex items-center">
          <img src="/jobtv-logo.png" alt="JobTV Logo" className="h-32 w-auto transition-transform hover:scale-105" />
        </Link>

        {/* Main Navigation Menu */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/" className="text-sm font-bold text-gray-700 hover:text-jobtv-teal transition-colors">Home</Link>
          <Link to="/for-companies" className="text-sm font-bold text-gray-700 hover:text-jobtv-teal transition-colors">Per le Aziende</Link>
          <Link to="/for-candidates" className="text-sm font-bold text-gray-700 hover:text-jobtv-teal transition-colors">Per i Candidati</Link>
          <Link to="/pricing-plans" className="text-sm font-bold text-gray-700 hover:text-jobtv-teal transition-colors">Piani</Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-jobtv-blue hover:text-jobtv-teal font-bold"
              onClick={() => triggerChatWithRole('candidate')}
            >
              <User className="w-4 h-4 mr-2" />
              Chat Candidato
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-jobtv-blue hover:bg-jobtv-teal font-bold shadow-md"
              onClick={() => triggerChatWithRole('company')}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Chat Azienda
            </Button>
          </div>
          
          <Button asChild variant="outline" size="sm" className="border-jobtv-teal text-jobtv-teal font-bold hover:bg-jobtv-teal hover:text-white">
            <Link to="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Accedi
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

export default Header;