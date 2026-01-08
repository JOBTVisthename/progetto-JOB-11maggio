
import { Loader2 } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function LoadingState() {
  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-jobtv-blue" />
      </div>
    </PageLayout>
  );
}
