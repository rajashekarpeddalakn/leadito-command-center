import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Shield, ShieldOff } from "lucide-react";

export default function UsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<Record<string, { leads: number; revenue: number }>>({});

  const load = async () => {
    const [{ data: profiles }, { data: roles }, { data: leads }, { data: ads }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
      supabase.from("leads").select("user_id"),
      supabase.from("ad_results").select("user_id,revenue"),
    ]);
    setRows(profiles ?? []);
    setAdminIds(new Set((roles ?? []).map(r => r.user_id)));
    const s: Record<string, { leads: number; revenue: number }> = {};
    (leads ?? []).forEach(l => { s[l.user_id] = s[l.user_id] || { leads: 0, revenue: 0 }; s[l.user_id].leads++; });
    (ads ?? []).forEach(a => { s[a.user_id] = s[a.user_id] || { leads: 0, revenue: 0 }; s[a.user_id].revenue += Number(a.revenue || 0); });
    setStats(s);
  };
  useEffect(() => { load(); }, []);

  const toggleAdmin = async (userId: string) => {
    if (adminIds.has(userId)) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin role removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Promoted to admin");
    }
    load();
  };

  return (
    <div>
      <PageHeader title="Users" description="All registered users and their activity." />
      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead>
              <TableHead>Company</TableHead><TableHead>Role</TableHead><TableHead>Leads</TableHead>
              <TableHead>Revenue</TableHead><TableHead>Joined</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(u => {
              const isAdmin = adminIds.has(u.id);
              const s = stats[u.id] || { leads: 0, revenue: 0 };
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>{u.company || "—"}</TableCell>
                  <TableCell>
                    {isAdmin ? <Badge className="bg-primary text-primary-foreground border-0">Admin</Badge> : <Badge variant="outline">User</Badge>}
                  </TableCell>
                  <TableCell>{s.leads}</TableCell>
                  <TableCell className="text-success">₹{s.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.id)}>
                      {isAdmin ? <><ShieldOff className="w-3 h-3 mr-1" />Demote</> : <><Shield className="w-3 h-3 mr-1" />Make admin</>}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!rows.length && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No users yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
