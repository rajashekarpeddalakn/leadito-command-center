import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { db } from "@/lib/mockStore";
import { toast } from "sonner";

export default function AdminLayout() {
  const reset = () => {
    if (!confirm("Reset all demo data back to the seed?")) return;
    db.reset();
    toast.success("Demo data reset");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-2 border-b bg-card/50 backdrop-blur px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset demo data
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
