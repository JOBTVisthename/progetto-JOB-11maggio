
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CompanyFormValues } from "./CompanyProfileSchema";

interface CompanyDetailsSectionProps {
  form: UseFormReturn<CompanyFormValues>;
}

export default function CompanyDetailsSection({ form }: CompanyDetailsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Settore</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il settore" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="tech">Tecnologia</SelectItem>
                <SelectItem value="finance">Finanza</SelectItem>
                <SelectItem value="healthcare">Sanità</SelectItem>
                <SelectItem value="education">Istruzione</SelectItem>
                <SelectItem value="retail">Commercio</SelectItem>
                <SelectItem value="manufacturing">Produzione</SelectItem>
                <SelectItem value="services">Servizi</SelectItem>
                <SelectItem value="other">Altro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="company_size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dimensione Azienda</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona la dimensione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1-10">1-10 dipendenti</SelectItem>
                <SelectItem value="11-50">11-50 dipendenti</SelectItem>
                <SelectItem value="51-200">51-200 dipendenti</SelectItem>
                <SelectItem value="201-500">201-500 dipendenti</SelectItem>
                <SelectItem value="501-1000">501-1000 dipendenti</SelectItem>
                <SelectItem value="1001+">1001+ dipendenti</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
