import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ResetPasswordDialogProps {
    user: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ user, open, onOpenChange }: ResetPasswordDialogProps) {
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const { toast } = useToast();

    const handleReset = async () => {
        if (!user || !newPassword) return;
        setLoading(true);
        try {
            // Use the Edge Function proxy to bypass broken frontend keys
            const { data, error } = await supabase.functions.invoke('admin-task-proxy', {
                body: {
                    action: 'reset_password',
                    payload: { userId: user.id, password: newPassword }
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            toast({
                title: "Password aggiornata",
                description: `La password per ${user.email} è stata resettata con successo.`,
            });
            setNewPassword("");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error resetting password:", error);
            toast({
                title: "Errore",
                description: error.message || "Impossibile resettare la password. Verifica i permessi della Service Role Key.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Imposta una nuova password per {user?.email}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nuova Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleReset}
                        disabled={loading || !newPassword}
                        className="w-full bg-jobtv-gradient"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Resetta Password
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
