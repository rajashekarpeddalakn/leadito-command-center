import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Shield, ShieldOff, Plus, Pencil, Trash2 } from "lucide-react";
import { db, useTable } from "@/lib/mockStore";

const empty: any = { full_name: "", email: "", phone: "", company: "", role: "user" };

export default function UsersPage() {
  const users = useTable("users");
  const leads = useTable("leads");
  const ads = useTable("ad_results");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  const stats: Record<string, { leads: number; revenue: number }> = {};
  leads.forEach(l => { stats[l.user_id] = stats[l.user_id] || { leads: 0, revenue: 0 }; stats[l.user_id].leads++; });
  ads.forEach(a => { stats[a.user_id] = stats[a.user_id] || { leads: 0, revenue: 0 }; stats[a.user_id].revenue += Number(a.revenue || 0); });

  const toggleAdmin = (id: string, current: string) => {
    db.update("users", id, { role: current === "admin" ? "user" : "admin" } as any);
    toast.success(current === "admin" ? "Demoted to user" : "Promoted to admin");
  };

  const save = () => {
    if (!editing.full_name || !editing.email) return toast.error("Name and email required");
    if (editing.id) db.update("users", editing.id, editing);
    else db.insert("users", editing);
    toast.success("Saved"); setOpen(false); setEditing(empty);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this user?")) return;
    db.remove("users", id); toast.success("Deleted");
  };

  return (
    <div>
      <PageHeader title="Users" description="All registered users and their activity."
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild><Button onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-2" />Add user</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} user</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Full name</Label><Input value={editing.full_name} onChange={e => setEditing({ ...editing, full_name: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} /></div>
                  <div><Label>Company</Label><Input value={editing.company} onChange={e => setEditing({ ...editing, company: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
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
            {users.map(u => {
              const isAdmin = u.role === "admin";
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
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.id, u.role)}>
                        {isAdmin ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(u); setOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(u.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!users.length && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No users yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
