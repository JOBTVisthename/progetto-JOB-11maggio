import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const editUserSchema = z.object({
    full_name: z.string().min(1, "Il nome è richiesto"),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
    user: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            full_name: user?.full_name || "",
        },
    });

    // Update form if user changes
    if (user?.full_name && form.getValues("full_name") !== user.full_name) {
        form.setValue("full_name", user.full_name);
    }

    const onSubmit = async (values: EditUserFormValues) => {
        if (!user) return;
        setLoading(true);
        try {
            // Update public.users or relevant profile
            // In this project, full_name might be in multiple places or specific profile tables
            // For simplicity, let's update candidate_profiles or company_profiles if they exist

            let error;
            if (user.user_type === 'candidate') {
                const { error: err } = await supabase
                    .from('candidate_profiles')
                    .update({ first_name: values.full_name.split(' ')[0], last_name: values.full_name.split(' ').slice(1).join(' ') })
                    .eq('id', user.id);
                error = err;
            } else if (user.user_type === 'company') {
                const { error: err } = await supabase
                    .from('company_profiles')
                    .update({ company_name: values.full_name })
                    .eq('id', user.id);
                error = err;
            }

            if (error) throw error;

            toast({
                title: "Utente aggiornato",
                description: "Le informazioni dell'utente sono state salvate.",
            });
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error("Error updating user:", error);
            toast({
                title: "Errore",
                description: error.message || "Impossibile aggiornare l'utente",
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
                    <DialogTitle>Modifica Utente</DialogTitle>
                    <DialogDescription>
                        Modifica le informazioni per {user?.email}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome / Azienda</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={loading} className="w-full bg-jobtv-gradient">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Salva Modifiche
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
