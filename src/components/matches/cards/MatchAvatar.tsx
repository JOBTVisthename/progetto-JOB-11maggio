
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "../utils/matchUtils";

interface MatchAvatarProps {
  otherParty: any;
  isCandidate: boolean;
}

export default function MatchAvatar({ otherParty, isCandidate }: MatchAvatarProps) {
  const avatarUrl = isCandidate 
    ? otherParty?.logo_url || otherParty?.profile_image_url
    : otherParty?.profile_image_url;
    
  const name = isCandidate 
    ? otherParty?.company_name 
    : `${otherParty?.first_name} ${otherParty?.last_name}`;
    
  return (
    <Avatar className="h-20 w-20">
      <AvatarImage 
        src={avatarUrl} 
        alt={name} 
      />
      <AvatarFallback className="text-xl">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
