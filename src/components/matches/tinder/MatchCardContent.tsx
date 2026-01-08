
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Briefcase, CalendarClock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { getInitials, getMatchStatus } from "../utils/matchUtils";
import { motion } from "framer-motion";

interface MatchCardContentProps {
  match: any;
  isCandidate: boolean;
  otherParty: any;
  isMatched: boolean;
  swipeDirection: 'right' | 'left' | null;
}

export const variants = {
  right: { x: 1000, opacity: 0, rotate: 10 },
  left: { x: -1000, opacity: 0, rotate: -10 },
  center: { x: 0, opacity: 1, rotate: 0 }
};

export default function MatchCardContent({ match, isCandidate, otherParty, isMatched, swipeDirection }: MatchCardContentProps) {
  return (
    <motion.div
      className="absolute top-0 left-0 right-0"
      initial="center"
      animate={swipeDirection ? swipeDirection : "center"}
      variants={variants}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg border-2 overflow-hidden">
        <div className="h-64 bg-gray-100 flex items-center justify-center">
          <Avatar className="h-32 w-32">
            <AvatarImage 
              src={isCandidate ? otherParty?.logo_url : undefined} 
              alt={isCandidate 
                ? otherParty?.company_name 
                : `${otherParty?.first_name} ${otherParty?.last_name}`} 
            />
            <AvatarFallback className="text-4xl">
              {isCandidate 
                ? getInitials(otherParty?.company_name) 
                : getInitials(`${otherParty?.first_name} ${otherParty?.last_name}`)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
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
            {getMatchStatus(match, isCandidate ? 'candidate' : 'company')}
          </div>
        </CardHeader>
        
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
      </Card>
    </motion.div>
  );
}
