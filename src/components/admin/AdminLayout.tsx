import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useLocation } from "react-router-dom";

import { Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin": "Performance Overview",
  "/admin/videos": "Video Management",
  "/admin/testimonials": "Client Reviews",
  "/admin/services": "Platform Services",
  "/admin/plans": "Subscription Plans",
  "/admin/ads": "Ad Performance Reports",
  "/admin/leads": "CRM Member Directory",
  "/admin/users": "Active Members List",
};

export default function AdminLayout() {
  const { pathname } = useLocation();

  // Handle nested leads path or find exact match
  const getPageTitle = () => {
    if (pathname.startsWith('/admin/leads/')) return "Lead Intelligence File";
    return pageTitles[pathname] || "Admin Command Center";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background/95">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-9 w-9" />
              <div className="h-6 w-px bg-border hidden md:block" />
              <div className="flex flex-col">
                <h2 className="font-bold text-sm md:text-base tracking-tight">{getPageTitle()}</h2>
                <div className="flex items-center gap-1.5 md:hidden">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-70">Live Panel</span>
                </div>
              </div>
            </div>
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
