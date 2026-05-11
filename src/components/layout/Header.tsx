import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/context/AuthContext";
import CreditsIndicator from "@/components/credits/CreditsIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Heart,
  Search,
  User,
  VideoIcon,
  Building,
  MessageSquare,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiresType?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    requiresType: "candidate"
  },
  {
    label: "Dashboard",
    path: "/company/dashboard",
    icon: <Building className="h-4 w-4" />,
    requiresType: "company"
  },
  {
    label: "Match",
    path: "/matches",
    icon: <Heart className="h-4 w-4" />
  },
  {
    label: "Cerca",
    path: "/search-candidates",
    icon: <Search className="h-4 w-4" />,
    requiresType: "company"
  },
  {
    label: "Video",
    path: "/video-interview",
    icon: <VideoIcon className="h-4 w-4" />,
    requiresType: "candidate"
  },
  {
    label: "Profilo",
    path: "/profile",
    icon: <User className="h-4 w-4" />
  },
  {
    label: "Messaggi",
    path: "/messages",
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    label: "Impostazioni",
    path: "/settings",
    icon: <Settings className="h-4 w-4" />
  }
];

const publicNavItems = [
  { label: "Home", path: "/" },
  { label: "Per i Candidati", path: "/for-candidates" },
  { label: "Per le Aziende", path: "/for-companies" },
  { label: "Piani", path: "/pricing-plans" },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState("??");
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const getUserProfile = async (retries = 3) => {
      if (!user) return;

      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", user.id)
            .single();

          if (error) {
            // If profile not found yet and we have retries left, wait and try again
            if (attempt < retries - 1 && (error.code === 'PGRST116' || error.code === '406')) {
              console.log(`Profile not ready, retrying... (${attempt + 1}/${retries})`);
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
            console.error("Error fetching profile:", error);
            return;
          }

          setUserType(profile.user_type);

          if (profile.user_type === "candidate") {
            const { data, error: candidateError } = await supabase
              .from("candidate_profiles")
              .select("first_name, last_name")
              .eq("id", user.id)
              .single();

            if (candidateError) {
              // If candidate profile not found yet and we have retries left, wait and try again
              if (attempt < retries - 1 && (candidateError.code === 'PGRST116' || candidateError.code === '406')) {
                console.log(`Candidate profile not ready, retrying... (${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
              }
              console.error("Error fetching candidate profile:", candidateError);
              // Fallback to email initials
              setUserInitials(user.email?.substring(0, 2).toUpperCase() ?? "??");
              return;
            }

            if (data?.first_name && data?.last_name) {
              setUserInitials(`${data.first_name[0]}${data.last_name[0]}`.toUpperCase());
            } else {
              setUserInitials(user.email?.substring(0, 2).toUpperCase() ?? "??");
            }
          } else if (profile.user_type === "company") {
            const { data, error: companyError } = await supabase
              .from("company_profiles")
              .select("company_name")
              .eq("id", user.id)
              .single();

            if (companyError) {
              // If company profile not found yet and we have retries left, wait and try again
              if (attempt < retries - 1 && (companyError.code === 'PGRST116' || companyError.code === '406')) {
                console.log(`Company profile not ready, retrying... (${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
              }
              console.error("Error fetching company profile:", companyError);
              // Fallback to email initials
              setUserInitials(user.email?.substring(0, 2).toUpperCase() ?? "??");
              return;
            }

            if (data?.company_name) {
              setUserInitials(data.company_name.substring(0, 2).toUpperCase());
            } else {
              setUserInitials(user.email?.substring(0, 2).toUpperCase() ?? "??");
            }
          }
          // Success! Break out of retry loop
          return;
        } catch (error) {
          console.error("Error in getUserProfile:", error);
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        }
      }
    };

    getUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => {
    return window.location.pathname === path;
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.requiresType) return true;
    return item.requiresType === userType;
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-lg border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center transition-all duration-300 hover:scale-105">
            <Logo />
          </Link>

          {/* Credits Indicator - Only for logged in companies */}
          {user && userType === 'company' && (
            <CreditsIndicator className="ml-6" />
          )}

          {/* Public Navigation - Not Logged In */}
          {!user && (
            <nav className="hidden md:flex items-center space-x-1">
              {publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg",
                    "hover:bg-accent hover:text-primary",
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* User Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:bg-accent transition-all duration-300"
                    >
                      <Avatar className="h-9 w-9 border-2 border-primary/30 hover:border-primary/50 transition-colors">
                        <AvatarFallback className="font-semibold text-sm bg-gradient-to-br from-jobtv-teal to-jobtv-blue text-white shadow-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">Account Utente</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {filteredNavItems.map((item) => (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link to={item.path} className="cursor-pointer py-2 px-3 hover:bg-accent transition-colors rounded-lg flex items-center">
                            {item.icon}
                            <span className="ml-2 font-medium">{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/help" className="cursor-pointer py-2 px-3 hover:bg-accent transition-colors rounded-lg flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span className="font-medium">Aiuto</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 px-3 hover:bg-destructive/10 text-destructive transition-colors rounded-lg">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="font-medium">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Not Logged In - Auth Buttons */}
                <Link to="/login">
                  <Button variant="outline" className="font-medium hover:bg-accent px-4 py-2 rounded-lg transition-all duration-300 text-sm">
                    Accedi
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="jobtv-button px-4 py-2 text-sm">
                    Registrati
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
