
import { Building, Briefcase, CalendarClock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getMatchStatus } from "../utils/matchUtils";

interface MatchDetailsProps {
  match: any;
  otherParty: any;
  isCandidate: boolean;
  userType: 'candidate' | 'company' | null;
  isMatched: boolean;
}

export default function MatchDetails({ match, otherParty, isCandidate, userType, isMatched }: MatchDetailsProps) {
  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>
            {isCandidate 
              ? otherParty?.company_name || "Azienda" 
              : `${otherParty?.first_name || "Nome"} ${otherParty?.last_name || "Cognome"}`}
          </CardTitle>
          <CardDescription className="flex items-center mt-1">
            {isCandidate ? (
              <>
                <Building className="h-4 w-4 mr-1" />
                {otherParty?.industry || "Settore non specificato"}
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 mr-1" />
                {otherParty?.desired_job_title || "Posizione non specificata"}
              </>
            )}
          </CardDescription>
        </div>
        {getMatchStatus(match, userType)}
      </div>
      
      <CardContent>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <CalendarClock className="h-4 w-4 mr-1" />
          Creato {formatDistanceToNow(new Date(match.created_at), { addSuffix: true, locale: it })}
        </div>
        
        {isMatched && (
          <div className="bg-green-50 p-3 rounded-md mt-2">
            <p className="text-green-800 text-sm font-medium">
              Congratulazioni! Avete fatto match. Ora potete comunicare direttamente.
            </p>
          </div>
        )}
      </CardContent>
    </>
  );
}
