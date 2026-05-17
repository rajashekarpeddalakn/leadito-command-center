import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import Overview from "./pages/admin/Overview.tsx";
import VideosPage from "./pages/admin/VideosPage.tsx";
import TestimonialsPage from "./pages/admin/TestimonialsPage.tsx";
import ServicesPage from "./pages/admin/ServicesPage.tsx";
import PlansPage from "./pages/admin/PlansPage.tsx";
import AdResultsPage from "./pages/admin/AdResultsPage.tsx";
import LeadsPage from "./pages/admin/LeadsPage.tsx";
import LeadDetailPage from "./pages/admin/LeadDetailPage.tsx";
import UsersPage from "./pages/admin/UsersPage.tsx";
import PendingPaymentsPage from "./pages/admin/PendingPaymentsPage.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsConditions from "./pages/TermsConditions.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="ads" element={<AdResultsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/:userId" element={<LeadDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="approvals" element={<PendingPaymentsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
