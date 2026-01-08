
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "react-router-dom";
import { Control } from "react-hook-form";
import { z } from "zod";

// Schema definition moved to a separate file
export const registerSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  confirmPassword: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  userType: z.enum(["candidate", "company"]),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Devi accettare i termini e le condizioni",
  }),
})
  .refine(data => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  })
  .refine(
    data => !(data.userType === "company" && (!data.companyName || data.companyName.trim() === "")), {
    message: "Il nome dell'azienda è obbligatorio",
    path: ["companyName"],
  }
  )
  .refine(
    data => !(data.userType === "candidate" && (!data.firstName || data.firstName.trim() === "")), {
    message: "Il nome è obbligatorio",
    path: ["firstName"],
  }
  )
  .refine(
    data => !(data.userType === "candidate" && (!data.lastName || data.lastName.trim() === "")), {
    message: "Il cognome è obbligatorio",
    path: ["lastName"],
  }
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface FormFieldsProps {
  control: Control<RegisterFormValues>;
  userType: "candidate" | "company";
}

export const EmailPasswordFields = ({ control }: { control: Control<RegisterFormValues> }) => {
  return (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="email@esempio.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Conferma Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export const UserTypeSelector = ({ control }: { control: Control<RegisterFormValues> }) => {
  return (
    <FormField
      control={control}
      name="userType"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Tipo di account</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer hover:border-jobtv-teal transition-colors">
                <RadioGroupItem value="candidate" id="candidate" />
                <FormLabel htmlFor="candidate" className="cursor-pointer">Sono un candidato</FormLabel>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer hover:border-jobtv-teal transition-colors">
                <RadioGroupItem value="company" id="company" />
                <FormLabel htmlFor="company" className="cursor-pointer">Sono un'azienda</FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const CompanyNameField = ({ control }: { control: Control<RegisterFormValues> }) => {
  return (
    <FormField
      control={control}
      name="companyName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome Azienda</FormLabel>
          <FormControl>
            <Input
              placeholder="Inserisci il nome dell'azienda"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const PersonalInfoFields = ({ control }: { control: Control<RegisterFormValues> }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Mario" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cognome *</FormLabel>
            <FormControl>
              <Input placeholder="Rossi" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export const TermsCheckbox = ({ control }: { control: Control<RegisterFormValues> }) => {
  return (
    <FormField
      control={control}
      name="acceptTerms"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id="acceptTerms"
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel htmlFor="acceptTerms" className="font-normal text-sm cursor-pointer">
              Accetto i <Link to="/terms" className="text-jobtv-blue hover:text-jobtv-teal underline">Termini e Condizioni</Link>
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
