import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

const empty = { user_id: "", campaign_name: "", period_start: "", period_end: "", budget_spent: 0, leads: 0, cost_per_lead: 0, closed_deals: 0, revenue: 0, roi: 0, notes: "" };

export default function AdResultsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  const load = async () => {
    const { data: u } = await supabase.from("profiles").select("id,email,full_name");
    setUsers(u ?? []);
    let q = supabase.from("ad_results").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("user_id", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message); else setRows(data ?? []);
  };
  useEffect(() => { load(); }, [filter]);

  const userLabel = (id: string) => {
    const u = users.find(x => x.id === id);
    return u ? (u.full_name || u.email) : id.slice(0, 8);
  };

  const save = async () => {
    if (!editing.user_id || !editing.campaign_name) return toast.error("User and campaign required");
    const payload: any = { ...editing };
    ["budget_spent", "leads", "cost_per_lead", "closed_deals", "revenue", "roi"].forEach(k => payload[k] = Number(payload[k]) || 0);
    if (!payload.period_start) payload.period_start = null;
    if (!payload.period_end) payload.period_end = null;
    const { error } = editing.id
      ? await supabase.from("ad_results").update(payload).eq("id", editing.id)
      : await supabase.from("ad_results").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("ad_results").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const totals = rows.reduce((a, r) => ({
    spent: a.spent + Number(r.budget_spent || 0),
    leads: a.leads + Number(r.leads || 0),
    revenue: a.revenue + Number(r.revenue || 0),
    deals: a.deals + Number(r.closed_deals || 0),
  }), { spent: 0, leads: 0, revenue: 0, deals: 0 });

  return (
    <div>
      <PageHeader title="Ad Results" description="Per-user campaign metrics: budget, leads, CPL, ROI."
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild><Button onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-2" />Add result</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} ad result</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>User</Label>
                    <Select value={editing.user_id} onValueChange={(v) => setEditing({ ...editing, user_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                      <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Campaign name</Label><Input value={editing.campaign_name} onChange={e => setEditing({ ...editing, campaign_name: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Period start</Label><Input type="date" value={editing.period_start ?? ""} onChange={e => setEditing({ ...editing, period_start: e.target.value })} /></div>
                  <div><Label>Period end</Label><Input type="date" value={editing.period_end ?? ""} onChange={e => setEditing({ ...editing, period_end: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Budget spent</Label><Input type="number" value={editing.budget_spent} onChange={e => setEditing({ ...editing, budget_spent: e.target.value })} /></div>
                  <div><Label>Leads</Label><Input type="number" value={editing.leads} onChange={e => setEditing({ ...editing, leads: e.target.value })} /></div>
                  <div><Label>Cost per lead</Label><Input type="number" value={editing.cost_per_lead} onChange={e => setEditing({ ...editing, cost_per_lead: e.target.value })} /></div>
                  <div><Label>Closed deals</Label><Input type="number" value={editing.closed_deals} onChange={e => setEditing({ ...editing, closed_deals: e.target.value })} /></div>
                  <div><Label>Revenue</Label><Input type="number" value={editing.revenue} onChange={e => setEditing({ ...editing, revenue: e.target.value })} /></div>
                  <div><Label>ROI (%)</Label><Input type="number" value={editing.roi} onChange={e => setEditing({ ...editing, roi: e.target.value })} /></div>
                </div>
                <div><Label>Notes</Label><Textarea value={editing.notes ?? ""} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Spend</p><p className="text-xl font-bold">₹{totals.spent.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Leads</p><p className="text-xl font-bold">{totals.leads}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Closed Deals</p><p className="text-xl font-bold">{totals.deals}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Revenue</p><p className="text-xl font-bold text-success">₹{totals.revenue.toLocaleString()}</p></CardContent></Card>
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
              <TableHead>User</TableHead><TableHead>Campaign</TableHead><TableHead>Spent</TableHead>
              <TableHead>Leads</TableHead><TableHead>CPL</TableHead><TableHead>Deals</TableHead>
              <TableHead>Revenue</TableHead><TableHead>ROI</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{userLabel(r.user_id)}</TableCell>
                <TableCell>{r.campaign_name}</TableCell>
                <TableCell>₹{Number(r.budget_spent).toLocaleString()}</TableCell>
                <TableCell>{r.leads}</TableCell>
                <TableCell>₹{Number(r.cost_per_lead).toLocaleString()}</TableCell>
                <TableCell>{r.closed_deals}</TableCell>
                <TableCell className="text-success font-medium">₹{Number(r.revenue).toLocaleString()}</TableCell>
                <TableCell>{r.roi}%</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No ad results yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
