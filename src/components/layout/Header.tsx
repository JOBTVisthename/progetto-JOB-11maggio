import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, VideoIcon, Menu, Heart, CreditCard, Settings, HelpCircle, LayoutDashboard, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [userInitials, setUserInitials] = useState("??");
  const [userType, setUserType] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUserProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (error) {
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
            console.error("Error fetching candidate profile:", candidateError);
            return;
          }

          if (data?.first_name && data?.last_name) {
            setUserInitials(`${data.first_name[0]}${data.last_name[0]}`.toUpperCase());
          } else {
            setUserInitials(user.email?.substring(0, 2).toUpperCase() || "??");
          }
        } else if (profile.user_type === "company") {
          const { data, error: companyError } = await supabase
            .from("company_profiles")
            .select("company_name")
            .eq("id", user.id)
            .single();

          if (companyError) {
            console.error("Error fetching company profile:", companyError);
            return;
          }

          if (data?.company_name) {
            setUserInitials(data.company_name.substring(0, 2).toUpperCase());
          } else {
            setUserInitials(user.email?.substring(0, 2).toUpperCase() || "??");
          }
        }
      } catch (error) {
        console.error("Error in getUserProfile:", error);
      }
    };

    if (user) {
      getUserProfile();
    }
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
    return location.pathname === path;
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Per i Candidati", path: "/for-candidates" },
    { label: "Per le Aziende", path: "/for-companies" },
    { label: "Piani", path: "/pricing-plans" },
  ];

  const userMenuItems = [
    {
      label: "Profilo",
      path: "/profile",
      icon: <User className="h-4 w-4 mr-2" />
    },
    ...(userType === "candidate" ? [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard className="h-4 w-4 mr-2" />
      },
      {
        label: "Video Interviste",
        path: "/video-interview",
        icon: <VideoIcon className="h-4 w-4 mr-2" />
      }
    ] : []),
    ...(userType === "company" ? [
      {
        label: "Dashboard",
        path: "/company/dashboard",
        icon: <LayoutDashboard className="h-4 w-4 mr-2" />
      },
      {
        label: "Cerca Candidati",
        path: "/search-candidates",
        icon: <Search className="h-4 w-4 mr-2" />
      }
    ] : []),
    {
      label: "Match",
      path: "/matches",
      icon: <Heart className="h-4 w-4 mr-2" />
    }
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
      ? 'bg-background/95 backdrop-blur-lg shadow-lg border-b'
      : 'bg-background/80 backdrop-blur-md border-b border-border/50'
      }`}>
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center transition-all duration-300 hover:scale-105 group">
            <div className="transition-transform duration-300 group-hover:rotate-3">
              <Logo />
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-1 ml-6 lg:ml-12">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative text-sm font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg ${isActive(item.path)
                    ? "text-primary bg-primary/10 shadow-sm border border-primary/20"
                    : "text-foreground hover:bg-accent hover:text-primary"
                    }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-accent transition-all duration-300 group"
                >
                  <Avatar className="h-9 w-9 border-2 border-primary/30 group-hover:border-primary/50 transition-colors">
                    <AvatarFallback className="font-semibold text-sm bg-gradient-to-br from-jobtv-teal to-jobtv-blue text-white shadow-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold leading-none">Account Utente</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="cursor-pointer py-3 px-4 hover:bg-accent transition-colors rounded-lg flex items-center">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer py-3 px-4 hover:bg-accent transition-colors rounded-lg flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="font-medium">Impostazioni</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/help" className="cursor-pointer py-3 px-4 hover:bg-accent transition-colors rounded-lg flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Aiuto</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-3 px-4 hover:bg-destructive/10 text-destructive transition-colors rounded-lg">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:space-x-2">
              <Link to="/pricing-plans">
                <Button variant="ghost" className="font-medium hover:bg-accent px-3 py-2 rounded-lg transition-all duration-300 text-sm">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Piani
                </Button>
              </Link>
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
            </div>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 hover:bg-accent transition-all duration-300 rounded-lg"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-l border-border/50">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold gradient-text">Menu</h3>
                    <div className="h-px bg-border"></div>
                  </div>

                  {navItems.map((item) => (
                    <SheetClose key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`text-base font-semibold transition-all duration-300 hover:text-primary hover:bg-accent py-3 px-4 rounded-lg flex items-center ${isActive(item.path)
                          ? "text-primary bg-primary/10 shadow-sm border border-primary/20"
                          : "text-foreground"
                          }`}
                      >
                        {item.label}
                        {isActive(item.path) && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </Link>
                    </SheetClose>
                  ))}

                  <div className="space-y-2">
                    <div className="h-px bg-border my-4"></div>
                    <h3 className="text-lg font-semibold gradient-text">Account</h3>
                  </div>

                  {user ? (
                    <>
                      {userMenuItems.map((item) => (
                        <SheetClose key={item.path} asChild>
                          <Link
                            to={item.path}
                            className="flex items-center text-base font-medium transition-colors hover:text-primary hover:bg-accent py-3 px-4 rounded-lg"
                          >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                          </Link>
                        </SheetClose>
                      ))}
                      <SheetClose asChild>
                        <Link
                          to="/settings"
                          className="flex items-center text-base font-medium transition-colors hover:text-primary hover:bg-accent py-3 px-4 rounded-lg"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          <span>Impostazioni</span>
                        </Link>
                      </SheetClose>
                      <button
                        onClick={handleLogout}
                        className="flex items-center text-base font-medium transition-colors hover:bg-destructive/10 text-destructive py-3 px-4 rounded-lg w-full text-left"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-3 pt-2">
                      <SheetClose asChild>
                        <Link to="/pricing-plans">
                          <Button variant="ghost" className="w-full font-medium justify-start px-4 py-3 rounded-lg">
                            <CreditCard className="h-4 w-4 mr-3" />
                            Piani
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/login">
                          <Button variant="outline" className="w-full font-medium px-4 py-3 rounded-lg">
                            Accedi
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/register">
                          <Button className="w-full jobtv-button px-4 py-3">
                            Registrati
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
