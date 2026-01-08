import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForCandidates from "./pages/ForCandidates";
import ForCompanies from "./pages/ForCompanies";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import VideoInterview from "./pages/VideoInterview";
import RecordInterview from "./pages/RecordInterview";
import Matches from "./pages/Matches";
import CandidateSearch from "@/pages/CandidateSearch";
import PricingPlans from "@/pages/PricingPlans";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmailConfirmation from "./pages/EmailConfirmation";
import AuthCallback from "./pages/AuthCallback";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { Suspense, lazy } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/for-candidates" element={<ForCandidates />} />
            <Route path="/for-companies" element={<ForCompanies />} />
            <Route path="/pricing-plans" element={<PricingPlans />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/search-candidates" element={<CandidateSearch />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-interview"
              element={
                <ProtectedRoute>
                  <VideoInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/record-interview"
              element={
                <ProtectedRoute>
                  <RecordInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <Matches />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
