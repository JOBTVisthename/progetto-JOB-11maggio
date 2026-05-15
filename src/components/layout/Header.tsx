import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Building2 } from 'lucide-react';

const Header: React.FC = () => {
  const triggerChatWithRole = (role: 'candidate' | 'company') => {
    window.dispatchEvent(new CustomEvent('open-jobtv-chat', { detail: { role } }));
  };

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo - Increased size */}
        <Link to="/" className="flex items-center">
          {/* Assumendo che il tuo logo sia in /jobtv-logo.png o simile */}
          <img src="/jobtv-logo.png" alt="JobTV Logo" className="h-16 w-auto" />
        </Link>

        {/* Navigation/Role Selection */}
        <nav className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className="text-jobtv-blue hover:text-jobtv-teal"
            onClick={() => triggerChatWithRole('candidate')}
          >
            <User className="w-4 h-4 mr-2" />
            Sono un Candidato
          </Button>
          <Button
            variant="default"
            className="bg-jobtv-blue hover:bg-jobtv-teal"
            onClick={() => triggerChatWithRole('company')}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Sono un'Azienda
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;