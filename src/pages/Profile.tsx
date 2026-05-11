import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [userType, setUserType] = useState<"candidate" | "company" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (data?.user_type === "candidate") {
        navigate("/candidate/profile", { replace: true });
      } else if (data?.user_type === "company") {
        navigate("/settings", { replace: true });
      }
    };

    if (user) {
      fetchUserType();
    }
  }, [user, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-jobtv-teal" />
        </div>
      </div>
    );
  }

  return null;
}
