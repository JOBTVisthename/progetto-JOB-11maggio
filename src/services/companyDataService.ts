// Servizio per recuperare dati aziendali da P.IVA
// Usa l'API pubblica di Testarossi e altre fonti

export interface CompanyData {
  name: string;
  city: string;
  sdi?: string;
  found: boolean;
}

export async function fetchCompanyDataByVAT(vat: string): Promise<CompanyData> {
  // Pulisce la P.IVA da spazi e caratteri speciali
  const cleanVat = vat.replace(/[^0-9]/g, "");

  if (cleanVat.length !== 11) {
    return { name: "", city: "", found: false };
  }

  try {
    // Prova con l'API di Testarossi (pubblico)
    const response = await fetch(
      `https://testarossi.it/api/search/full/${cleanVat}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    ).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      if (data.data) {
        return {
          name: data.data.denominazione || "",
          city: data.data.comune || "",
          sdi: data.data.sdi || "",
          found: true,
        };
      }
    }

    // Se Testarossi non funziona, prova con VIES per partita IVA estere
    // o ritorna vuoto se italiana
    return { name: "", city: "", found: false };
  } catch (error) {
    console.error("Errore nel fetch dei dati aziendali:", error);
    return { name: "", city: "", found: false };
  }
}

// Valida il formato della P.IVA italiana (11 cifre)
export function isValidItalianVAT(vat: string): boolean {
  const cleanVat = vat.replace(/[^0-9]/g, "");
  return cleanVat.length === 11 && /^\d{11}$/.test(cleanVat);
}

// Formatta la P.IVA nel formato leggibile
export function formatVAT(vat: string): string {
  const clean = vat.replace(/[^0-9]/g, "");
  if (clean.length !== 11) return vat;
  return `${clean.substring(0, 2)} ${clean.substring(2, 5)} ${clean.substring(5, 8)} ${clean.substring(8, 11)}`;
}
