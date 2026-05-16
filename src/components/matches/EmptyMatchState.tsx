
import { useState } from "react";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyMatchStateProps {
  userType: 'candidate' | 'company' | null;
  message?: string;
  title?: string;
}

export default function EmptyMatchState({ userType, message, title }: EmptyMatchStateProps) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const defaultTitle = title || "Nessun match disponibile";
  const defaultMessage = message || (userType === 'candidate' 
    ? "Non hai ancora ricevuto match da aziende" 
    : "Non hai ancora creato match con candidati");

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm bg-white/95 backdrop-blur-md border-jobtv-blue/10 border-l-4 border-l-jobtv-teal">
          <DialogHeader>
            <DialogTitle className="text-center">Nessun match disponibile</DialogTitle>
            <DialogDescription className="text-center">
              METTI UN ANNUNCIO e REGISTRA IL TUO VIDEO ORA
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3">
            <Button
              className="w-full bg-jobtv-gradient text-white shadow-lg hover:scale-105 transition-all duration-300"
              onClick={() => {
                setOpen(false);
                navigate(userType === "candidate" ? "/register/candidate" : "/create-job-offer");
              }}
            >
              {userType === "candidate" ? "Registrati e crea il tuo profilo" : "Crea la tua offerta"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              Capito
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">{defaultTitle}</h3>
        <p className="text-gray-500 mb-4">{defaultMessage}</p>
      </div>
    </>
  );
}
