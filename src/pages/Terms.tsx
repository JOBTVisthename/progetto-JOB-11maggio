import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Scale } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <Header />

      <main className="section-padding">
        <div className="container container-padding max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-blue/10 border border-jobtv-blue/20 text-jobtv-blue text-sm font-medium mb-6">
              <FileText className="w-4 h-4 mr-2" />
              Termini & Condizioni
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Termini e Condizioni della Piattaforma Job TV
            </h1>
            <p className="text-lg text-gray-600">
              Uso della piattaforma Job TV per candidati, aziende e partner
            </p>
          </div>

          {/* Premessa */}
          <Card className="mb-8 bg-gradient-to-br from-jobtv-teal/5 to-jobtv-blue/5 border-jobtv-teal/20">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                <strong>Premessa / Definizioni:</strong> Questi Termini & Condizioni ("Termini") regolano l'accesso e l'utilizzo
                da parte di utenti (candidati), aziende / clienti e partner della piattaforma Job TV (sito, app, servizi video,
                matching, annunci). Devono essere accettati al momento della registrazione / prima dell'uso.
              </p>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="space-y-6">
            <Section number={1} title="Registrazione / Account">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Per accedere ai servizi, è necessario registrarsi e fornire dati veritieri</li>
                <li>L'utente è responsabile di mantenere segrete le credenziali</li>
                <li>È vietato condividere l'account</li>
              </ul>
            </Section>

            <Section number={2} title="Utilizzo della Piattaforma">
              <p className="text-gray-600 leading-relaxed mb-4">Job TV consente:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Candidati:</strong> creazione profilo, caricamento video CV, candidatura ad annunci, partecipazione a interviste video</li>
                <li><strong>Aziende:</strong> pubblicazione annunci, visionatura profili, contatto candidati</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Job TV può imporre limiti e regole (es. numero candidature, qualità video).
              </p>
            </Section>

            <Section number={3} title="Diritti e Doveri degli Utenti">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Utenti / Candidati:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>fornire dati e contenuti leali, non diffamatori</li>
                    <li>rispettare normativa privacy</li>
                    <li>non usare contenuti protetti da copyright altrui</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Aziende:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>utilizzo corretto dei dati candidati</li>
                    <li>non discriminazione</li>
                    <li>rispetto normativa lavoro / privacy</li>
                    <li>non uso improprio dei profili</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Entrambi:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>impegno a non compromettere la piattaforma (es. hacking, scraping non autorizzato)</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section number={4} title="Proprietà Intellettuale">
              <p className="text-gray-600 leading-relaxed mb-4">
                Tutti i contenuti generati o caricati (video CV, testi, immagini) restano proprietà dell'utente ma
                concedono a Job TV una licenza non esclusiva, gratuita, mondiale per l'uso tecnico, pubblicazione
                (nei limiti del servizio), visualizzazione alle aziende.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Job TV è autorizzata a mostrare, trasmettere, archiviare i video / CV agli attori della catena (aziende, selezionatori)</li>
                <li>In caso di rimozione, Job TV smetterà di renderli visibili, pur potendo conservarli secondo politiche privacy</li>
              </ul>
            </Section>

            <Section number={5} title="Limitazioni di Responsabilità">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Job TV non garantisce che ogni candidatura porti a un'assunzione</li>
                <li>Non garantisce che il sistema di matching sia perfetto o esente da errori / bias</li>
                <li>Non è responsabile per condotte indebite da parte di aziende / utenti (es. discriminazioni, abuso)</li>
                <li><strong>Limitazione damages:</strong> In nessun caso la responsabilità complessiva di Job TV supererà l'importo
                  delle somme ricevute dall'azienda / cliente relativamente al servizio in questione</li>
              </ul>
            </Section>

            <Section number={6} title="Durata / Recesso / Sospensione">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>L'utente può cancellare l'account in qualsiasi momento</li>
                <li>Job TV può sospendere / chiudere account in caso di violazione dei Termini, abuso, frodi</li>
                <li>Le aziende possono recedere dal servizio con preavviso (es. 30 giorni)</li>
                <li>Clausola per rimozione di contenuti non conformi / segnalati</li>
              </ul>
            </Section>

            <Section number={7} title="Legge Applicabile / Foro Competente">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>I Termini sono regolati dalla legge italiana</li>
                <li>Per controversie, foro competente è Milano (sede Job TV), salvo diversa disposizione imperativa</li>
                <li>Mediazione / arbitrato obbligatorio se richiesto dalla normativa</li>
              </ul>
            </Section>

            <Section number={8} title="Modifiche ai Termini">
              <p className="text-gray-600 leading-relaxed">
                Job TV può modificare i Termini: le modifiche saranno efficaci dopo preavviso (es. 30 giorni) e
                accettazione implicita / esplicita, se del caso. Gli utenti verranno informati via email e tramite banner.
              </p>
            </Section>

            <Section number={9} title="Disposizioni Varie">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Comunicazioni tra le parti via email / canali interni</li>
                <li><strong>Clausola separabilità:</strong> se una disposizione è invalida, le restanti restano valide</li>
                <li>Nessuna deroga se non scritta e firmata</li>
              </ul>
            </Section>
          </div>

          {/* Company Info Card */}
          <Card className="mt-8 bg-gradient-to-br from-gray-50 to-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Scale className="w-5 h-5 text-jobtv-teal mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900 mb-2">Job TV S.r.l.</div>
                  <div className="text-sm text-gray-600">
                    Via G. Mazzini 3/C, 20063 Cernusco sul Naviglio (MI)<br />
                    P.IVA: 14375330967<br />
                    <a href="mailto:privacy@jobtv.it" className="text-jobtv-blue hover:text-jobtv-teal underline">privacy@jobtv.it</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface SectionProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ number, title, children }) => (
  <Card className="card-hover">
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-jobtv-teal text-white rounded-full flex items-center justify-center font-bold">
          {number}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
          {children}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Terms;
