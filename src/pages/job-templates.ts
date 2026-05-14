export const jobTemplates: Record<string, { description: string; skills: string[]; salary_range: string }> = {
  "Sviluppatore Frontend": {
    description: "Cerchiamo uno sviluppatore appassionato per creare interfacce utente reattive e intuitive. Ti occuperai della traduzione dei design in codice funzionale.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Git"],
    salary_range: "30.000€ - 45.000€"
  },
  "Commerciale": {
    description: "La risorsa si occuperà dello sviluppo del portafoglio clienti e della gestione delle trattative commerciali dalla fase di lead alla chiusura.",
    skills: ["Vendita B2B", "CRM", "Negoziazione", "Public Speaking"],
    salary_range: "25.000€ + Provvigioni"
  },
  "Magazziniere": {
    description: "Gestione delle merci in entrata e uscita, preparazione ordini e controllo qualità del packaging. Richiesta precisione e puntualità.",
    skills: ["Uso transpallet", "Gestione inventario", "Patentino muletto"],
    salary_range: "1.200€ - 1.500€ / mese"
  },
  "Addetto Vendite": {
    description: "Accoglienza clienti, assistenza all'acquisto e gestione della cassa. Cerchiamo persone solari con ottime doti comunicative.",
    skills: ["Assistenza clienti", "Gestione cassa", "Visual Merchandising"],
    salary_range: "18.000€ - 24.000€"
  }
};

export const getTemplateByTitle = (title: string) => {
  const key = Object.keys(jobTemplates).find(k => title.toLowerCase().includes(k.toLowerCase()));
  return key ? jobTemplates[key] : {
    description: "Inserisci qui una descrizione dettagliata del ruolo...",
    skills: [],
    salary_range: ""
  };
};