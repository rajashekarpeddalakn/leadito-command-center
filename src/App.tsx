import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import Overview from "./pages/admin/Overview.tsx";
import VideosPage from "./pages/admin/VideosPage.tsx";
import TestimonialsPage from "./pages/admin/TestimonialsPage.tsx";
import ServicesPage from "./pages/admin/ServicesPage.tsx";
import PlansPage from "./pages/admin/PlansPage.tsx";
import AdResultsPage from "./pages/admin/AdResultsPage.tsx";
import LeadsPage from "./pages/admin/LeadsPage.tsx";
import UsersPage from "./pages/admin/UsersPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="ads" element={<AdResultsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
