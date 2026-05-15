
import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  withoutPadding?: boolean;
}

export default function PageLayout({ children, withoutPadding = false }: PageLayoutProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Forza lo scroll all'inizio della pagina ogni volta che il percorso cambia
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow ${!withoutPadding ? 'pt-20 pb-12' : 'pt-16'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
