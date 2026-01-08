
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Logo() {
  return (
    <div className="flex items-center">
      <img 
        src="/lovable-uploads/1d997ce4-b13a-4620-9808-d1179a0e513a.png" 
        alt="JobTV Logo" 
        className={cn("h-10 w-auto object-contain")}
      />
    </div>
  );
}
