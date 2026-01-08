
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MessageList from "./MessageList";

interface MessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  otherUser: any;
  userType: 'candidate' | 'company' | null;
}

export default function MessagesDialog({ 
  isOpen, 
  onClose, 
  matchId, 
  otherUser, 
  userType 
}: MessagesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Messaggi</DialogTitle>
        </DialogHeader>
        <MessageList 
          matchId={matchId}
          otherUser={otherUser}
          userType={userType}
        />
      </DialogContent>
    </Dialog>
  );
}
