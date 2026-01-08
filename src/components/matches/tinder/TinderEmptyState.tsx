
import { Heart } from "lucide-react";

interface TinderEmptyStateProps {
  allSwipedType?: boolean;
  message?: string;
  title?: string;
}

export default function TinderEmptyState({ allSwipedType = false, message, title }: TinderEmptyStateProps) {
  const defaultTitle = title || (allSwipedType ? "Nessun altro profilo disponibile" : "Nessun match disponibile");
  const defaultMessage = message || (allSwipedType ? "Hai visto tutti i profili disponibili" : "Non hai ancora ricevuto match");

  return (
    <div className="text-center py-12 bg-gray-50 rounded-xl">
      <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">{defaultTitle}</h3>
      <p className="text-gray-500 mb-4">{defaultMessage}</p>
    </div>
  );
}
