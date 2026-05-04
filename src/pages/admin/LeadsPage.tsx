import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { db, useTable, LeadStatus } from "@/lib/mockStore";

const STATUSES: LeadStatus[] = ["new", "converted", "on_hold", "not_interested", "not_answered", "follow_up", "closed", "appointment_booked"];

const statusColor: Record<string, string> = {
  new: "bg-info/15 text-info",
  converted: "bg-success/15 text-success",
  on_hold: "bg-warning/15 text-warning",
  not_interested: "bg-destructive/15 text-destructive",
  not_answered: "bg-muted text-muted-foreground",
  follow_up: "bg-primary/15 text-primary",
  closed: "bg-success/15 text-success",
  appointment_booked: "bg-accent text-accent-foreground",
};

const niceStatus = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const empty: any = { user_id: "", name: "", phone: "", email: "", source: "Facebook", status: "new", follow_up_date: "", deal_value: 0, notes: "" };

export default function LeadsPage() {
  const allRows = useTable("leads");
  const users = useTable("users").filter(u => u.role !== "admin");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  const rows = filter === "all" ? allRows : allRows.filter(r => r.user_id === filter);

  const userLabel = (id: string) => {
    const u = users.find(x => x.id === id);
    return u ? (u.full_name || u.email) : id.slice(0, 8);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    STATUSES.forEach(s => c[s] = 0);
    rows.forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [rows]);

  const save = () => {
    if (!editing.user_id || !editing.name) return toast.error("User and lead name required");
    const payload = { ...editing, deal_value: Number(editing.deal_value) || 0 };
    if (editing.id) db.update("leads", editing.id, payload);
    else db.insert("leads", payload);
    toast.success("Saved"); setOpen(false); setEditing(empty);
  };

  const remove = (id: string) => {
    if (!confirm("Delete?")) return;
    db.remove("leads", id); toast.success("Deleted");
  };

  return (
    <div>
      <PageHeader title="CRM Leads" description="Lead pipeline submitted by users from the app."
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild><Button onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-2" />Add lead</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} lead</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>User</Label>
                    <Select value={editing.user_id} onValueChange={(v) => setEditing({ ...editing, user_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                      <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Lead name</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Source</Label><Input value={editing.source} onChange={e => setEditing({ ...editing, source: e.target.value })} /></div>
                  <div>
                    <Label>Status</Label>
                    <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{niceStatus(s)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Deal value</Label><Input type="number" value={editing.deal_value} onChange={e => setEditing({ ...editing, deal_value: e.target.value })} /></div>
                </div>
                <div><Label>Follow-up date</Label><Input type="date" value={editing.follow_up_date ?? ""} onChange={e => setEditing({ ...editing, follow_up_date: e.target.value })} /></div>
                <div><Label>Notes</Label><Textarea value={editing.notes ?? ""} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
        {STATUSES.map(s => (
          <Card key={s} className="shadow-card">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{niceStatus(s)}</p>
              <p className="text-xl font-bold">{counts[s] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Label>Filter by user:</Label>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead><TableHead>Lead name</TableHead><TableHead>Phone</TableHead>
              <TableHead>Email</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead>
              <TableHead>Follow-up</TableHead><TableHead>Deal value</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{userLabel(r.user_id)}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.source}</TableCell>
                <TableCell><Badge className={`${statusColor[r.status]} border-0`}>{niceStatus(r.status)}</Badge></TableCell>
                <TableCell>{r.follow_up_date || "—"}</TableCell>
                <TableCell>₹{Number(r.deal_value || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No leads yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
