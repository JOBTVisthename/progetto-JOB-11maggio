
import { Heart } from "lucide-react";

interface EmptyMatchStateProps {
  userType: 'candidate' | 'company' | null;
  message?: string;
  title?: string;
}

export default function EmptyMatchState({ userType, message, title }: EmptyMatchStateProps) {
  const defaultTitle = title || "Nessun match disponibile";
  const defaultMessage = message || (userType === 'candidate' 
    ? "Non hai ancora ricevuto match da aziende" 
    : "Non hai ancora creato match con candidati");

  return (
    <div className="text-center py-12 bg-gray-50 rounded-xl">
      <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">{defaultTitle}</h3>
      <p className="text-gray-500 mb-4">{defaultMessage}</p>
    </div>
  );
}
