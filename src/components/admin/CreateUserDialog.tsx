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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const userSchema = z.object({
    email: z.string().email("Email non valida"),
    password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
    user_type: z.enum(["candidate", "company"]),
    full_name: z.string().min(1, "Il nome è richiesto"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: "",
            password: "",
            user_type: "candidate",
            full_name: "",
        },
    });

    const onSubmit = async (values: UserFormValues) => {
        setLoading(true);
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        user_type: values.user_type,
                        full_name: values.full_name,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // Wait a small amount for triggers to complete if they handle profile creation
                // However, we can also manually ensure profiles exist if needed.
                // Actually, the database already has triggers in many Supabase templates.

                toast({
                    title: "Utente creato",
                    description: `L'utente ${values.email} è stato creato con successo.`,
                });
                form.reset();
                onOpenChange(false);
                onSuccess();
            }
        } catch (error: any) {
            console.error("Error creating user:", error);
            toast({
                title: "Errore",
                description: error.message || "Impossibile creare l'utente",
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
                    <DialogTitle>Crea Nuovo Utente</DialogTitle>
                    <DialogDescription>
                        Inserisci i dettagli per il nuovo utente. Verrà inviata un'email di conferma se abilitata.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo / Azienda</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mario Rossi o Nome Azienda" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="mario@esempio.it" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="user_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo Utente</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleziona tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="candidate">Candidato</SelectItem>
                                            <SelectItem value="company">Azienda</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={loading} className="w-full bg-jobtv-gradient">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Crea Utente
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
