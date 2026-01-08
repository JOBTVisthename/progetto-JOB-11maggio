import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Mail, 
  Smartphone, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Save
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved');
  };

  const handleExportData = () => {
    // Export user data logic here
    console.log('Exporting user data');
  };

  const handleDeleteAccount = () => {
    // Delete account logic here
    console.log('Deleting account');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <Header />
      
      <main className="section-padding">
        <div className="container container-padding max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text text-balance">
              Impostazioni
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-balance">
              Gestisci il tuo account, privacy e preferenze personalizzate
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profilo</span>
              </TabsTrigger>
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
            <TabsContent value="profile" className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-jobtv-teal" />
                    <span>Informazioni Profilo</span>
                  </CardTitle>
                  <CardDescription>
                    Aggiorna le informazioni del tuo account e le preferenze personali
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input id="firstName" placeholder="Mario" defaultValue="Mario" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Cognome</Label>
                      <Input id="lastName" placeholder="Rossi" defaultValue="Rossi" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="mario.rossi@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input id="phone" type="tel" placeholder="+39 333 1234567" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Moon className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Modalità Scura</div>
                        <div className="text-sm text-gray-500">Attiva tema scuro</div>
                      </div>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode}
                      className="data-[state=checked]:bg-jobtv-teal"
                    />
                  </div>
                </CardContent>
              </Card>

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
                    <select id="language" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20">
                      <option value="it">Italiano</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Orario</Label>
                    <select id="timezone" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20">
                      <option value="Europe/Rome">Europe/Rome (UTC+1)</option>
                      <option value="Europe/London">Europe/London (UTC+0)</option>
                      <option value="America/New_York">America/New_York (UTC-5)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 animate-fade-in">
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
            <TabsContent value="security" className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-jobtv-teal" />
                    <span>Sicurezza Account</span>
                  </CardTitle>
                  <CardDescription>
                    Proteggi il tuo account con misure di sicurezza avanzate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Cambia Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Password Attuale</Label>
                        <div className="relative">
                          <Input 
                            id="currentPassword" 
                            type={showPassword ? "text" : "password"}
                            placeholder="Inserisci password attuale"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nuova Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password"
                          placeholder="Inserisci nuova password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Autenticazione a Due Fattori</div>
                        <div className="text-sm text-gray-500">Aggiungi un livello extra di sicurezza</div>
                      </div>
                    </div>
                    <Switch 
                      checked={twoFactorEnabled} 
                      onCheckedChange={setTwoFactorEnabled}
                      className="data-[state=checked]:bg-jobtv-teal"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Sessioni Attive</h4>
                    <div className="space-y-3">
                      {[
                        { device: 'Chrome su Windows', location: 'Milano, Italia', time: '2 ore fa', current: true },
                        { device: 'Safari su iPhone', location: 'Roma, Italia', time: '1 giorno fa', current: false }
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium">{session.device}</div>
                              <div className="text-sm text-gray-500">{session.location} • {session.time}</div>
                            </div>
                          </div>
                          {session.current && <Badge className="bg-green-100 text-green-800">Attuale</Badge>}
                          {!session.current && <Button variant="outline" size="sm">Termina</Button>}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-jobtv-teal" />
                    <span>Privacy e Dati</span>
                  </CardTitle>
                  <CardDescription>
                    Gestisci i tuoi dati personali e le preferenze di privacy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Esporta Dati</h4>
                    <p className="text-gray-600">
                      Scarica una copia di tutti i tuoi dati personali in formato JSON
                    </p>
                    <Button 
                      onClick={handleExportData}
                      variant="outline" 
                      className="w-full md:w-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Esporta Dati
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Elimina Account</h4>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="text-gray-700 mb-4">
                        L'eliminazione dell'account è permanente e non può essere annullata. 
                        Tutti i tuoi dati verranno rimossi.
                      </p>
                      <Button 
                        onClick={handleDeleteAccount}
                        variant="destructive" 
                        className="w-full md:w-auto"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Elimina Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="mt-8 text-center">
            <Button 
              onClick={handleSave}
              size="lg" 
              className="jobtv-button px-8 py-4"
            >
              <Save className="mr-2 h-5 w-5" />
              Salva Impostazioni
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
