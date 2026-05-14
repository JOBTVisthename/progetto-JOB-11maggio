import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Dichiarazione per TypeScript
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Inizializza Google Analytics se non è già stato fatto
    if (typeof window !== 'undefined' && window.gtag) {
      // Traccia la visualizzazione di pagina
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Funzione per tracciare eventi personalizzati
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        page_location: window.location.href,
      });
    }
  };

  // Funzione per tracciare conversioni
  const trackConversion = (conversionId: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `GA_MEASUREMENT_ID/${conversionId}`,
        ...parameters,
      });
    }
  };

  // Esponi le funzioni globalmente per uso in altri componenti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).analytics = {
        trackEvent,
        trackConversion,
      };
    }
  }, []);

  return null; // Questo componente non renderizza nulla
}

// Hook personalizzato per usare analytics in altri componenti
export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.trackEvent(eventName, parameters);
    }
  };

  const trackConversion = (conversionId: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.trackConversion(conversionId, parameters);
    }
  };

  return { trackEvent, trackConversion };
};