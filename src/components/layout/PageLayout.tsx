
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  withoutPadding?: boolean;
}

export default function PageLayout({ children, withoutPadding = false }: PageLayoutProps) {
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
