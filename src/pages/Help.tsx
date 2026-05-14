import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Headphones,
  Send
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GuidedChatBot from '@/components/ui/GuidedChatBot';

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = [
    { id: 'all', name: 'Tutte le categorie', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'account', name: 'Account', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'billing', name: 'Fatturazione', icon: <FileText className="w-4 h-4" /> },
    { id: 'matching', name: 'Matching', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'video', name: 'Video Interviste', icon: <Video className="w-4 h-4" /> },
    { id: 'technical', name: 'Supporto Tecnico', icon: <Headphones className="w-4 h-4" /> }
  ];

  const faqs = [
    {
      category: 'account',
      question: 'Come posso creare un account?',
      answer: 'Per creare un account, clicca sul pulsante "Registrati" in alto a destra. Compila il modulo con i tuoi dati personali, scegli se sei un candidato o un\'azienda e segui i passaggi per completare la registrazione.',
      popular: true
    },
    {
      category: 'account',
      question: 'Come posso modificare il mio profilo?',
      answer: 'Accedi al tuo account e vai alla sezione "Profilo". Da lì puoi aggiornare le tue informazioni personali, caricare o modificare il tuo CV e aggiungere video interviste.',
      popular: false
    },
    {
      category: 'matching',
      question: 'Come funziona il sistema di matching?',
      answer: 'Il nostro algoritmo analizza il tuo profilo e le tue preferenze per trovarti i migliori match. Le aziende possono visualizzare i profili candidati e indicare interesse con un "Mi piace". Se l\'interesse è reciproco, si apre una conversazione diretta.',
      popular: true
    },
    {
      category: 'video',
      question: 'Come funzionano le video interviste?',
      answer: 'Puoi registrare una o più video interviste direttamente dal tuo profilo. Queste video saranno visibili alle aziende che cercano candidati con le tue caratteristiche. Assicurati di avere una buona connessione internet e un ambiente tranquillo.',
      popular: true
    },
    {
      category: 'billing',
      question: 'Quali metodi di pagamento accettate?',
      answer: 'Accettiamo tutte le principali carte di credito (Visa, MasterCard, American Express), PayPal e bonifici bancari per piani annuali. Tutti i pagamenti sono sicuri e crittografati.',
      popular: false
    },
    {
      category: 'billing',
      question: 'Posso cambiare piano in qualsiasi momento?',
      answer: 'Sì, puoi passare a un piano superiore o inferiore in qualsiasi momento dalla sezione "Piani". Il cambiamento sarà effettivo dal prossimo ciclo di fatturazione.',
      popular: false
    },
    {
      category: 'technical',
      question: 'La piattaforma è disponibile su mobile?',
      answer: 'Sì, JobTV è completamente responsive e funziona perfettamente su smartphone e tablet. Puoi anche scaricare la nostra app mobile disponibile per iOS e Android.',
      popular: true
    },
    {
      category: 'technical',
      question: 'Cosa faccio se ho problemi tecnici?',
      answer: 'Se riscontri problemi tecnici, prima prova a cancellare la cache del browser e a riavviare il dispositivo. Se il problema persiste, contatta il nostro supporto tecnico tramite chat, email o telefono.',
      popular: false
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const helpArticles = [
    {
      title: 'Guida rapida per candidati',
      description: 'Tutto quello che devi sapere per iniziare come candidato',
      category: 'Candidati',
      readTime: '5 min',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      title: 'Guida rapida per aziende',
      description: 'Come usare JobTV per trovare i migliori talenti',
      category: 'Aziende',
      readTime: '7 min',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      title: 'Video interviste perfette',
      description: 'Consigli per creare video interviste di successo',
      category: 'Video',
      readTime: '10 min',
      icon: <Video className="w-5 h-5" />
    },
    {
      title: 'Ottimizza il tuo profilo',
      description: 'Come rendere il tuo profilo più attrattivo',
      category: 'Profilo',
      readTime: '6 min',
      icon: <FileText className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <Header />
      
      <main className="section-padding">
        <div className="container container-padding max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-blue/10 border border-jobtv-blue/20 text-jobtv-blue text-sm font-medium mb-6">
              <Headphones className="w-4 h-4 mr-2" />
              Centro Assistenza
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text text-balance">
              Come possiamo aiutarti?
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto text-balance mb-8">
              Trova risposte rapide, guide dettagliate o contatta direttamente il nostro team di supporto
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Cerca una domanda, argomento o parola chiave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20 rounded-xl"
                />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
              <TabsTrigger value="faq" className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4" />
                <span>Domande Frequenti</span>
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Guide e Tutorial</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Contatta Supporto</span>
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-4">Categorie</h3>
                  <div className="space-y-2">
                    {faqCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-jobtv-teal text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {category.icon}
                        <span className="font-medium">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {filteredFaqs.length} risultati trovati
                    </h3>
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSearchQuery('')}
                      >
                        Cancella ricerca
                      </Button>
                    )}
                  </div>

                  <Accordion type="single" collapsible className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg">
                        <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-gray-900">{faq.question}</span>
                              {faq.popular && (
                                <Badge className="bg-jobtv-teal text-white">Popolare</Badge>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {filteredFaqs.length === 0 && (
                    <div className="text-center py-12">
                      <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun risultato trovato</h3>
                      <p className="text-gray-600 mb-4">
                        Prova con altre parole chiave o contatta il nostro supporto
                      </p>
                      <Button 
                        onClick={() => setActiveTab('contact')}
                        className="jobtv-button"
                      >
                        Contatta Supporto
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {helpArticles.map((article, index) => (
                  <Card key={index} className="card-hover group">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-jobtv-teal/10 rounded-lg flex items-center justify-center text-jobtv-teal group-hover:bg-jobtv-teal group-hover:text-white transition-colors">
                          {article.icon}
                        </div>
                        <Badge variant="outline" className="border-jobtv-teal text-jobtv-teal">
                          {article.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-semibold mb-2 group-hover:text-jobtv-teal transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-jobtv-teal hover:text-jobtv-blue">
                          Leggi
                          <ArrowRight className="ml-1 w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-jobtv-teal/5 to-jobtv-blue/5 border-jobtv-teal/20">
                  <CardContent className="p-0 text-center">
                    <BookOpen className="w-12 h-12 text-jobtv-teal mx-auto mb-4" />
                    <h3 className="text-2xl font-bold gradient-text mb-4">
                      Non trovi quello che cerchi?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Il nostro team di esperti è pronto ad aiutarti con qualsiasi domanda
                    </p>
                    <Button 
                      onClick={() => setActiveTab('contact')}
                      className="jobtv-button px-8 py-4"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Contatta il Supporto
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="card-hover group">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                      <MessageCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold mb-2">Chat Live</CardTitle>
                    <CardDescription>
                      Chat immediata con il nostro team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Disponibile</div>
                      <div className="font-medium text-green-600">Online ora</div>
                      <Button 
                        className="w-full jobtv-button mt-4"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-jobtv-chat'))}
                      >
                        Inizia Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover group">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-jobtv-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-jobtv-teal group-hover:text-white transition-colors">
                      <Mail className="w-8 h-8 text-jobtv-teal" />
                    </div>
                    <CardTitle className="text-xl font-semibold mb-2">Email</CardTitle>
                    <CardDescription>
                      Risposta entro 24 ore
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">mail CEO@JOBTV.IT</div>
                      <div className="text-sm text-gray-500">Lun-Ven 9:00-18:00</div>
                      <Button className="w-full mt-4 border-2 border-jobtv-teal text-jobtv-teal hover:bg-jobtv-teal hover:text-white">
                        Invia Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover group">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <Phone className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold mb-2">Telefono</CardTitle>
                    <CardDescription>
                      Supporto telefonico diretto
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">+39 380 759 0948</div>
                      <div className="text-sm text-gray-500">Lun-Ven 9:00-18:00</div>
                      <Button className="w-full mt-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                        Chiama Ora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold gradient-text mb-4">
                    Inviaci un messaggio
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Compila il modulo sottostante e ti risponderemo il prima possibile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-medium text-gray-900">Nome</label>
                      <Input placeholder="Il tuo nome" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium text-gray-900">Email</label>
                      <Input type="email" placeholder="tua.email@example.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-gray-900">Argomento</label>
                    <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20">
                      <option>Seleziona un argomento</option>
                      <option>Problemi tecnici</option>
                      <option>Domande sul profilo</option>
                      <option>Assistenza fatturazione</option>
                      <option>Altro</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-gray-900">Messaggio</label>
                    <textarea 
                      placeholder="Descrivi nel dettaglio la tua richiesta..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20 min-h-[120px] resize-vertical"
                    />
                  </div>

                  <div className="text-center">
                    <Button className="jobtv-button px-8 py-4">
                      <Send className="mr-2 h-5 w-5" />
                      Invia Messaggio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <GuidedChatBot />
      
      <Footer />
    </div>
  );
};

export default Help;
