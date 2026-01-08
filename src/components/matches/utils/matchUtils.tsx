
import { Badge } from "@/components/ui/badge";

export function getInitials(name: string = "") {
  if (!name) return "?";
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getMatchStatus(match: any, userType: 'candidate' | 'company' | null) {
  if (match.match_status === 'matched') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Match Confermato
      </Badge>
    );
  }

  if (userType === 'candidate') {
    if (match.company_liked && !match.candidate_liked) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Like Ricevuto
        </Badge>
      );
    }
    if (!match.company_liked && match.candidate_liked) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          In Attesa di Risposta
        </Badge>
      );
    }
  } else {
    if (!match.company_liked && match.candidate_liked) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Like Ricevuto
        </Badge>
      );
    }
    if (match.company_liked && !match.candidate_liked) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          In Attesa di Risposta
        </Badge>
      );
    }
  }
  
  return (
    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
      Nessun Like
    </Badge>
  );
}
