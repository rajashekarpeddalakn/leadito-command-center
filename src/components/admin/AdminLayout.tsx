import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-soft p-4">
        <div className="max-w-md text-center bg-card p-8 rounded-2xl shadow-elegant border">
          <Shield className="w-12 h-12 mx-auto text-primary mb-3" />
          <h2 className="text-2xl font-bold mb-2">Admin access required</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Your account is signed in as a regular user. Ask an existing admin (or update the database) to grant you the <code className="bg-muted px-1.5 py-0.5 rounded">admin</code> role in the <code className="bg-muted px-1.5 py-0.5 rounded">user_roles</code> table.
          </p>
          <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-2 border-b bg-card/50 backdrop-blur px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
          </header>
          <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
