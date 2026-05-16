import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie as CookieIcon, Settings, ExternalLink, Shield } from 'lucide-react';
import PageLayout from "@/components/layout/PageLayout";

const Cookie: React.FC = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white py-10">
        <div className="container container-padding max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-blue/10 border border-jobtv-blue/20 text-jobtv-blue text-sm font-medium mb-6">
              <CookieIcon className="w-4 h-4 mr-2" />
              Cookie Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              COOKIE POLICY – JOB TV ITALIA S.r.l.
            </h1>
            <p className="text-lg text-gray-600">
              Job TV S.r.l. - Via G. Mazzini 3/C, 20063 Cernusco sul Naviglio (MI) - P.IVA 14375330967
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Che cosa sono i cookie */}
            <Section title="Che cosa sono i cookie" icon={<CookieIcon className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed">
                I cookie sono file salvati sul dispositivo dell'utente che permettono il funzionamento del sito
                e la fornitura di servizi di analisi, preferenze e marketing.
              </p>
            </Section>

            {/* Tipologie di cookie utilizzati */}
            <Section title="Tipologie di cookie utilizzati" icon={<Settings className="w-5 h-5" />}>
              <div className="space-y-4">
                <CookieType
                  letter="A"
                  title="Cookie tecnici (necessari)"
                  consent="Non richiedono consenso"
                  description="Servono per:"
                  items={["login", "gestione account", "sicurezza", "funzionamento sito e app"]}
                />
                <CookieType
                  letter="B"
                  title="Cookie di preferenze"
                  consent="Richiedono consenso"
                  description="Memorizzano scelte dell'utente."
                  items={[]}
                />
                <CookieType
                  letter="C"
                  title="Cookie analitici"
                  consent="Richiedono consenso se non anonimizzati"
                  description="Servono a raccogliere statistiche anonime."
                  items={[]}
                />
                <CookieType
                  letter="D"
                  title="Cookie di marketing / profilazione"
                  consent="Richiedono consenso esplicito"
                  description="Usati per annunci personalizzati."
                  items={[]}
                />
                <CookieType
                  letter="E"
                  title="Cookie di terze parti"
                  consent="Richiedono consenso"
                  description="Es. Google Analytics, Meta Pixel, TikTok Pixel, YouTube."
                  items={[]}
                />
              </div>
            </Section>

            {/* Tabella cookie */}
            <Section title="Tabella cookie" icon={<Settings className="w-5 h-5" />}>
              <p className="text-sm text-gray-500 mb-4">(Esempio — da completare secondo i cookie effettivi installati)</p>
              <TableContent
                headers={["Nome", "Provider", "Finalità", "Durata", "Tipo"]}
                rows={[
                  ["_jobtv_session", "Job TV", "Sessione/login", "Sessione", "Tecnico"],
                  ["_ga", "Google", "Analisi traffico", "2 anni", "Analitico"],
                  ["_fbp", "Meta", "Profilazione/ads", "3 mesi", "Marketing"],
                  ["VISITOR_INFO1_LIVE", "YouTube", "Funzionamento player", "6 mesi", "Terze parti"]
                ]}
              />
            </Section>

            {/* Cookie banner e consenso */}
            <Section title="Cookie banner e consenso" icon={<Shield className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed mb-4">
                All'accesso al sito, l'utente visualizza un banner che permette di:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Accettare tutti</li>
                <li>Rifiutare tutti</li>
                <li>Personalizzare le scelte</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Nessun cookie non tecnico viene installato prima del consenso (opt-in).</strong>
                </p>
              </div>
            </Section>

            {/* Revoca del consenso */}
            <Section title="Revoca del consenso" icon={<Settings className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed mb-4">
                L'utente può modificare le preferenze in qualsiasi momento cliccando su:
              </p>
              <div className="bg-jobtv-teal/10 border border-jobtv-teal/20 rounded-lg p-4">
                <p className="text-gray-700">
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  <strong>"Modifica preferenze cookie"</strong> (link presente nel footer)
                </p>
              </div>
            </Section>

            {/* Trasferimenti extra-UE */}
            <Section title="Trasferimenti extra-UE" icon={<Shield className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed mb-4">
                I cookie di terze parti possono trasferire dati fuori dall'Unione Europea (es. USA).
                Job TV garantisce:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>SCC (Standard Contractual Clauses)</li>
                <li>Misure di sicurezza aggiuntive</li>
                <li>Obblighi contrattuali con il fornitore</li>
              </ul>
            </Section>

            {/* Come disabilitare i cookie tramite browser */}
            <Section title="Come disabilitare i cookie tramite browser" icon={<Settings className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed mb-4">Link alle istruzioni:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <BrowserLink name="Chrome" url="https://support.google.com/chrome/answer/95647" />
                <BrowserLink name="Safari" url="https://support.apple.com/guide/safari/sfri11471/mac" />
                <BrowserLink name="Firefox" url="https://support.mozilla.org/kb/clear-cookies-and-site-data-firefox" />
                <BrowserLink name="Edge" url="https://support.microsoft.com/microsoft-edge/delete-cookies" />
              </div>
            </Section>

            {/* Diritti dell'utente */}
            <Section title="Diritti dell'utente" icon={<Shield className="w-5 h-5" />}>
              <p className="text-gray-600 leading-relaxed">
                È possibile esercitare i diritti previsti dal GDPR (rettifica, cancellazione, opposizione, revoca)
                scrivendo a <a href="mailto:privacy@jobtv.it" className="text-jobtv-blue hover:text-jobtv-teal underline">privacy@jobtv.it</a>
              </p>
            </Section>

            {/* Data ultimo aggiornamento */}
            <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Ultimo aggiornamento: 28 Gennaio 2025</p>
                  <p className="text-xs text-gray-400">Versione: v1.0 – Cookie Policy Job TV</p>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="bg-gradient-to-br from-jobtv-teal/5 to-jobtv-blue/5 border-jobtv-teal/20">
              <CardContent className="p-6">
                <div className="text-center text-sm text-gray-700 space-y-1">
                  <p className="font-semibold">JOB TV ITALIA S.r.l.</p>
                  <p>P.IVA 14375330967 - PEC: <a href="mailto:jobtv@pecimprese.it" className="text-jobtv-blue hover:text-jobtv-teal underline">jobtv@pecimprese.it</a></p>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>HQ:</strong> Via G. Mazzini 3/C, 20063 Cernusco sul Naviglio (MI)<br />
                    <strong>Operations:</strong> Viale Filippo Meda 23, 20017 Rho (MI)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <Card className="card-hover">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        {title}
        {icon && <span className="ml-2 text-jobtv-teal">{icon}</span>}
      </h2>
      {children}
    </CardContent>
  </Card>
);

interface CookieTypeProps {
  letter: string;
  title: string;
  consent: string;
  description: string;
  items: string[];
}

const CookieType: React.FC<CookieTypeProps> = ({ letter, title, consent, description, items }) => (
  <div className="border-l-4 border-jobtv-teal pl-4 py-2">
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold text-gray-900">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-jobtv-teal text-white text-sm rounded-full mr-2">
          {letter}
        </span>
        {title}
      </h4>
      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{consent}</span>
    </div>
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    {items.length > 0 && (
      <ul className="list-disc list-inside text-sm text-gray-600 ml-8">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    )}
  </div>
);

interface TableContentProps {
  headers: string[];
  rows: string[][];
}

const TableContent: React.FC<TableContentProps> = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-50">
          {headers.map((header, i) => (
            <th key={i} scope="col" className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-gray-600">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface BrowserLinkProps {
  name: string;
  url: string;
}

const BrowserLink: React.FC<BrowserLinkProps> = ({ name, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-jobtv-teal hover:bg-jobtv-teal/5 transition-colors text-sm font-medium text-gray-700"
  >
    {name}
    <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
  </a>
);

export default Cookie;
