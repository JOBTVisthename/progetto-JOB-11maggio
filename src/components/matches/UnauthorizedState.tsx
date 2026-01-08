
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";

export default function UnauthorizedState() {
  const navigate = useNavigate();
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accesso Richiesto</h1>
          <p className="mb-6">Devi essere autenticato per visualizzare questa pagina.</p>
          <Button onClick={() => navigate("/login")}>Accedi</Button>
        </div>
      </div>
    </PageLayout>
  );
}
