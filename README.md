# JobTV - Piattaforma di Video Interviste e Matching

Benvenuto in JobTV! Questa è una piattaforma web moderna progettata per connettere candidati e aziende attraverso video interviste e un sistema di matching intelligente.

## Tecnologie Utilizzate

Il progetto è costruito utilizzando le seguenti tecnologie:

*   **Vite:** Build tool frontend di nuova generazione.
*   **React:** Libreria JavaScript per la costruzione di interfacce utente.
*   **TypeScript:** Superset di JavaScript che aggiunge tipizzazione statica.
*   **Tailwind CSS:** Framework CSS utility-first per un design rapido.
*   **shadcn/ui:** Collezione di componenti UI riutilizzabili.
*   **Supabase:** Backend-as-a-Service open source (alternativa a Firebase).
*   **React Router:** Libreria per la gestione del routing lato client.
*   **React Hook Form:** Libreria per la gestione dei form.
*   **Zod:** Libreria per la validazione di schemi e tipi.
*   **TanStack Query (React Query):** Libreria per il data fetching e caching.

## Prerequisiti

Assicurati di avere installato Node.js (versione 18 o superiore) e npm (o bun/yarn) sul tuo sistema.

## Installazione e Avvio

Segui questi passaggi per configurare ed eseguire il progetto in locale:

1.  **Clona il repository:**
    ```bash
    git clone <URL_DEL_TUO_REPOSITORY_GIT>
    cd career-vista-find # O il nome della cartella del progetto
    ```

2.  **Installa le dipendenze:**
    ```bash
    npm install
    # oppure se usi bun:
    # bun install
    # oppure se usi yarn:
    # yarn install
    ```

3.  **Configura le variabili d'ambiente:**
    *   Crea un file `.env` nella root del progetto.
    *   Aggiungi le chiavi API e l'URL del tuo progetto Supabase:
        ```env
        VITE_SUPABASE_URL=TUA_URL_SUPABASE
        VITE_SUPABASE_ANON_KEY=TUA_CHIAVE_ANON_SUPABASE
        ```
    *   Puoi trovare questi valori nella dashboard del tuo progetto Supabase (Impostazioni > API).

4.  **Avvia il server di sviluppo:**
    ```bash
    npm run dev
    # oppure
    # bun run dev
    # oppure
    # yarn dev
    ```
    Questo comando avvierà l'applicazione in modalità sviluppo con hot-reloading. Apri il browser all'indirizzo indicato nel terminale (solitamente `http://localhost:5173`).

## Struttura del Progetto

La struttura delle cartelle principali è la seguente:

```
career-vista-find/
├── public/             # File statici (immagini, favicon, ecc.)
├── src/                # Codice sorgente dell'applicazione
│   ├── components/     # Componenti React riutilizzabili (UI, layout, specifici per feature)
│   │   ├── auth/
│   │   ├── home/
│   │   ├── layout/
│   │   ├── matches/
│   │   ├── messages/
│   │   ├── profile/
│   │   ├── search/
│   │   ├── ui/         # Componenti shadcn/ui
│   │   └── video/
│   ├── context/        # Context API di React (es. AuthContext)
│   ├── hooks/          # Custom Hooks React
│   ├── integrations/   # Integrazioni con servizi esterni (es. Supabase)
│   │   └── supabase/
│   ├── lib/            # Funzioni di utilità generale (es. utils.ts)
│   ├── pages/          # Componenti React che rappresentano le pagine dell'applicazione
│   ├── App.tsx         # Componente principale dell'applicazione (routing)
│   ├── main.tsx        # Punto di ingresso dell'applicazione
│   └── index.css       # Stili globali e configurazione Tailwind
├── supabase/           # Configurazione locale di Supabase (se utilizzata)
├── .env.example        # Esempio di file per le variabili d'ambiente
├── .gitignore          # File e cartelle ignorati da Git
├── index.html          # Template HTML principale
├── package.json        # Metadati del progetto e dipendenze
├── tsconfig.json       # Configurazione TypeScript
├── vite.config.ts      # Configurazione di Vite
└── README.md           # Questo file
```

## Script Disponibili

Nel file `package.json`, troverai i seguenti script principali:

*   `npm run dev`: Avvia il server di sviluppo.
*   `npm run build`: Compila l'applicazione per la produzione nella cartella `dist`.
*   `npm run lint`: Esegue ESLint per analizzare il codice e trovare problemi.
*   `npm run preview`: Avvia un server locale per visualizzare la build di produzione.

## Deployment

Puoi deployare facilmente questa applicazione Vite React su piattaforme come Netlify o Vercel.

### Deployment su Netlify

1.  **Push del codice:** Assicurati che il tuo codice sia aggiornato sul tuo repository Git (GitHub, GitLab, Bitbucket).
2.  **Crea un nuovo sito su Netlify:**
    *   Accedi al tuo account Netlify.
    *   Clicca su "Add new site" > "Import an existing project".
    *   Collega il tuo provider Git e seleziona il repository del progetto.
3.  **Configura le impostazioni di build:**
    *   **Branch to deploy:** Seleziona il branch principale (es. `main`).
    *   **Build command:** `npm run build` (o `bun run build` / `yarn build`).
    *   **Publish directory:** `dist`
4.  **Aggiungi le variabili d'ambiente:**
    *   Vai su "Site settings" > "Build & deploy" > "Environment".
    *   Aggiungi le stesse variabili d'ambiente definite nel tuo file `.env` ( `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`). **Importante:** Non committare mai il tuo file `.env` con le chiavi segrete nel repository Git.
5.  **Deploy:** Clicca su "Deploy site". Netlify costruirà e deployerà automaticamente il tuo sito.

### Deployment su Vercel

1.  **Push del codice:** Assicurati che il tuo codice sia aggiornato sul tuo repository Git.
2.  **Crea un nuovo progetto su Vercel:**
    *   Accedi al tuo account Vercel.
    *   Clicca su "Add New..." > "Project".
    *   Importa il repository Git del tuo progetto.
3.  **Configura il progetto:**
    *   Vercel solitamente rileva automaticamente che si tratta di un progetto Vite.
    *   Verifica che le impostazioni di build siano corrette:
        *   **Framework Preset:** Vite
        *   **Build Command:** `npm run build` (o `bun run build` / `yarn build`)
        *   **Output Directory:** `dist`
4.  **Aggiungi le variabili d'ambiente:**
    *   Vai su "Settings" > "Environment Variables".
    *   Aggiungi `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` con i rispettivi valori.
5.  **Deploy:** Clicca su "Deploy". Vercel costruirà e deployerà il tuo sito.

---

Contribuire al progetto è benvenuto! Sentiti libero di aprire issue o pull request.
