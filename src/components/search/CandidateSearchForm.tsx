import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Video, Filter, Briefcase, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const searchFormSchema = z.object({
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  hasVideo: z.boolean().optional(),
  experience: z.string().optional(),
  contractType: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface CandidateSearchFormProps {
  onSearch: (filters: SearchFormValues) => void;
}

export default function CandidateSearchForm({ onSearch }: CandidateSearchFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      jobTitle: "",
      location: "",
      availability: "any",
      hasVideo: false,
      experience: "any",
      contractType: "any",
    }
  });

  const handleSubmit = (values: SearchFormValues) => {
    console.log("Search values:", values);
    
    toast({
      title: "Ricerca avviata",
      description: "Cercando candidati corrispondenti...",
      variant: "default",
    });
    
    onSearch(values);
  };

  const clearAllFilters = () => {
    form.reset();
    toast({
      title: "Filtri rimossi",
      description: "Tutti i filtri di ricerca sono stati resettati",
      variant: "default",
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Main Search Card */}
        <Card className="border-jobtv-teal/20 bg-gradient-to-br from-white via-jobtv-teal/5 to-jobtv-blue/5 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-jobtv-gradient rounded-lg">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Trova Talenti</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-jobtv-teal hover:text-jobtv-blue hover:bg-jobtv-teal/10 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showAdvanced ? "Semplice" : "Avanzata"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center text-sm font-semibold text-gray-700">
                      <Briefcase className="h-4 w-4 mr-2 text-jobtv-teal" />
                      Ruolo Ricercato
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Es. Sviluppatore Web, Designer..." 
                        {...field}
                        className="h-12 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20 transition-all duration-200 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center text-sm font-semibold text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-jobtv-teal" />
                      Località
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Città, provincia o remoto" 
                        {...field}
                        className="h-12 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20 transition-all duration-200 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center text-sm font-semibold text-gray-700">
                      <Clock className="h-4 w-4 mr-2 text-jobtv-teal" />
                      Disponibilità
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20 transition-all duration-200 text-base">
                          <SelectValue placeholder="Seleziona disponibilità" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="any">Qualsiasi</SelectItem>
                        <SelectItem value="immediate">Immediata</SelectItem>
                        <SelectItem value="weekend">Weekend</SelectItem>
                        <SelectItem value="shift">Turni</SelectItem>
                        <SelectItem value="relocate">Trasferta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Card className="border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Filtri Avanzati</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">Esperienza</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20 transition-all duration-200 text-base">
                            <SelectValue placeholder="Seleziona esperienza" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Qualsiasi</SelectItem>
                          <SelectItem value="0-2">0-2 anni</SelectItem>
                          <SelectItem value="3-5">3-5 anni</SelectItem>
                          <SelectItem value="6-10">6-10 anni</SelectItem>
                          <SelectItem value="10+">10+ anni</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">Tipo Contratto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-jobtv-teal focus:ring-2 focus:ring-jobtv-teal/20 transition-all duration-200 text-base">
                            <SelectValue placeholder="Seleziona contratto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Qualsiasi</SelectItem>
                          <SelectItem value="full-time">Tempo Pieno</SelectItem>
                          <SelectItem value="part-time">Tempo Parziale</SelectItem>
                          <SelectItem value="contract">Contratto</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasVideo"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">Video Presentazione</FormLabel>
                      <div className="h-12 border-2 border-gray-200 rounded-xl flex items-center px-4 transition-all duration-200">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 text-jobtv-teal focus:ring-jobtv-teal/20"
                          />
                        </FormControl>
                        <label 
                          htmlFor="hasVideo" 
                          className="ml-3 text-sm text-gray-700 cursor-pointer flex items-center"
                        >
                          <Video className="h-4 w-4 mr-2 text-jobtv-teal" />
                          Solo candidati con video
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            className="bg-jobtv-gradient h-14 px-12 text-lg font-bold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl"
          >
            <Search className="h-6 w-6 mr-3" />
            Cerca Candidati
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
