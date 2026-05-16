import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Mail, Building2, FileText } from 'lucide-react';
import PageLayout from "@/components/layout/PageLayout";

const Privacy: React.FC = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white py-10">
        <div className="container container-padding max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-jobtv-blue/10 border border-jobtv-blue/20 text-jobtv-blue text-sm font-medium mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Informativa sul trattamento dei dati personali
            </h1>
          </div>

          {/* Company Info */}
          <Card className="mb-8 bg-gradient-to-br from-jobtv-teal/5 to-jobtv-blue/5 border-jobtv-teal/20">
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
                    <div className="font-semibold text-gray-900">Contatti</div>
                    <div className="text-sm text-gray-600">privacy@jobtv.it</div>
                    <div className="text-sm text-gray-600">dpo@jobtv.it (DPO)</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                Ultimo aggiornamento: 28/01/2025
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="space-y-6">
            <Section number={1} title="Introduzione">
              <p className="text-gray-600 leading-relaxed mb-4">
                Benvenuto su Job TV. La presente informativa ("Informativa", "Privacy Policy") descrive come raccogliamo,
                utilizziamo, conserviamo, trasferiamo e proteggiamo i dati personali che acquisiamo da candidati, aziende
                e altri utenti ("interessati") nell'ambito dei nostri servizi di video recruiting, matching AI, pubblicazione
                annunci, gestione CV, colloqui via video e servizi correlati.
              </p>
              <p className="text-gray-600 leading-relaxed">
                L'obiettivo è garantire trasparenza, conformità al Regolamento UE 2016/679 (GDPR) e alle normative italiane vigenti.
              </p>
            </Section>

            <Section number={2} title="Titolare del trattamento">
              <p className="text-gray-600 leading-relaxed">
                Il Titolare del trattamento è Job TV S.r.l., con sede legale in Via G. Mazzini 3/C, 20063 Cernusco sul Naviglio (MI),
                P.IVA / Codice fiscale: 14375330967.
              </p>
            </Section>

            <Section number={3} title="Ambito / Destinatari">
              <p className="text-gray-600 leading-relaxed mb-4">La presente informativa si applica a:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>candidati / utenti che utilizzano la piattaforma / app / sito / modulo video per creare profili, caricare video CV, partecipare a selezioni</li>
                <li>aziende / clienti che pubblicano annunci, ricevono candidati, gestiscono selezioni</li>
                <li>visitatori del sito / utenti che navigano e interagiscono con contenuti di Job TV</li>
              </ul>
            </Section>

            <Section number={4} title="Tipologie di dati trattati">
              <TableContent
                headers={["Categoria dati", "Esempi", "Finalità principali"]}
                rows={[
                  ["Dati identificativi", "nome, cognome, data di nascita, email, telefono", "registrazione, profilo utente, comunicazioni"],
                  ["Dati professionali / curriculum", "formazione, esperienze, competenze", "matching, selezione, visualizzazione profilo"],
                  ["Video / audio", "video CV, interviste registrate, registrazioni", "valutazione, matching, visualizzazione azienda"],
                  ["Dati tecnici / di navigazione", "indirizzo IP, log server, cookie, device", "sicurezza, funzionalità, analisi traffico"],
                  ["Dati algoritmici / punteggi", "punteggi di matching, metriche interne", "ranking, matching, ottimizzazione servizi"],
                  ["Dati di comunicazione", "email, messaggi chat, feedback", "comunicazioni, supporto, notifiche"],
                  ["Dati sensibili", "es. disabilità (solo se forniti)", "per particolari servizi (solo con consenso)"]
                ]}
              />
            </Section>

            <Section number={5} title="Finalità del trattamento e basi giuridiche">
              <TableContent
                headers={["Finalità", "Base giuridica", "Note"]}
                rows={[
                  ["Erogazione del servizio", "esecuzione del contratto", "necessario per usare la piattaforma"],
                  ["Matching / valutazione", "legittimo interesse / contratto", "con bilanciamento diritti interessato"],
                  ["Marketing", "consenso esplicito", "previo opt-in, revocabile"],
                  ["Analisi / miglioramento", "legittimo interesse", "analisi aggregata / anonimizzazione"],
                  ["Adempimenti legali", "obbligo di legge", "obblighi fiscali, sicurezza, antiriciclaggio"],
                  ["Contestazioni / reclami", "interesse legittimo", "per difendere i propri diritti"]
                ]}
              />
            </Section>

            <Section number={6} title="Conferimento dati: obbligatorio vs facoltativo">
              <p className="text-gray-600 leading-relaxed mb-4">
                Alcuni dati sono obbligatori per consentire l'uso della piattaforma o l'accesso a specifici servizi (es. registrazione, caricamento CV).
                Altri sono facoltativi (es. video esperienziale opzionale).
              </p>
              <p className="text-gray-600 leading-relaxed">
                Se non forniti, potrebbe non essere possibile usare alcune funzionalità.
              </p>
            </Section>

            <Section number={7} title="Destinatari dei dati">
              <p className="text-gray-600 leading-relaxed mb-4">I dati possono essere comunicati a:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Società affiliate / controllate / partner contrattuali</li>
                <li>Fornitori di servizi IT / cloud / hosting</li>
                <li>Consulenti / professionisti esterni</li>
                <li>Società incaricate di assistenza tecnica / manutenzione</li>
                <li>Autorità pubbliche / organi giudiziari, se richiesto per legge</li>
                <li>Terze parti coinvolte in servizi integrati</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Se vi è trasferimento verso paesi terzi (fuori UE / SEE), verranno utilizzate garanzie adeguate (clausole standard UE, misure tecniche).
              </p>
            </Section>

            <Section number={8} title="Periodi di conservazione">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Profili attivi:</strong> conservazione finché l'utente mantiene account attivo</li>
                <li><strong>Profilo inattivo (&gt; 3 anni):</strong> archiviazione / cancellazione (24–36 mesi di inattività)</li>
                <li><strong>Video / registrazioni:</strong> conservazione per 12–24 mesi salvo richieste di cancellazione</li>
                <li><strong>Dati tecnici / log:</strong> conservazione minima necessaria (6–24 mesi), salvo obblighi di legge</li>
                <li><strong>Dati per marketing:</strong> fino a revoca del consenso</li>
              </ul>
            </Section>

            <Section number={9} title="Diritti degli interessati">
              <p className="text-gray-600 leading-relaxed mb-4">Hai il diritto di:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Accesso ai tuoi dati</li>
                <li>Rettifica</li>
                <li>Cancellazione ("diritto all'oblio")</li>
                <li>Limitazione del trattamento</li>
                <li>Portabilità dei dati</li>
                <li>Opposizione al trattamento</li>
                <li>Revoca del consenso</li>
                <li>Richiedere spiegazioni su decisioni automatizzate</li>
                <li>Reclamo al Garante per la protezione dei dati</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Per esercitare tali diritti, scrivi a: <a href="mailto:privacy@jobtv.it" className="text-jobtv-blue hover:text-jobtv-teal underline">privacy@jobtv.it</a> o <a href="mailto:dpo@jobtv.it" className="text-jobtv-blue hover:text-jobtv-teal underline">dpo@jobtv.it</a>
              </p>
            </Section>

            <Section number={10} title="Decisioni automatizzate / AI">
              <p className="text-gray-600 leading-relaxed mb-4">
                Job TV può utilizzare algoritmi / sistemi di matching automatici per valutare e assegnare punteggi ai candidati.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Tali decisioni non sono vincolanti: esiste sempre supervisione umana</li>
                <li>Viene garantita la possibilità di chiedere revisione manuale</li>
                <li>L'utente ha diritto a conoscere le logiche principali, variabili considerate, limiti</li>
                <li>Viene effettuata valutazione d'impatto (DPIA) preventiva per sistemi a rischio elevato</li>
                <li>Misure di mitigazione bias e controlli periodici sono implementati</li>
              </ul>
            </Section>

            <Section number={11} title="Misure di sicurezza">
              <p className="text-gray-600 leading-relaxed">
                Job TV adotta misure tecniche e organizzative adeguate (crittografia, accessi protetti, backup, monitoraggio) per proteggere i dati.
                Vengono effettuati audit, test di vulnerabilità, controlli interni per garantire riservatezza, integrità, disponibilità.
              </p>
            </Section>

            <Section number={12} title="Modifiche all'informativa">
              <p className="text-gray-600 leading-relaxed">
                Possiamo aggiornare la presente informativa (es. per novità normative, evoluzioni tecnologiche) – la versione aggiornata
                sarà pubblicata sul sito con data di efficacia. Se modifiche significative, avviseremo gli utenti attivi via email.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </PageLayout>
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

interface TableContentProps {
  headers: string[];
  rows: string[][];
}

const TableContent: React.FC<TableContentProps> = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-50">
          {headers.map((header, i) => (
            <th key={i} scope="col" className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Privacy;
