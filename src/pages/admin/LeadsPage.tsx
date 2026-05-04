import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

const STATUSES = ["new", "converted", "on_hold", "not_interested", "not_answered", "follow_up", "closed", "appointment_booked"] as const;

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

export default function LeadsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data: u } = await supabase.from("profiles").select("id,email,full_name");
    setUsers(u ?? []);
    let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("user_id", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message); else setRows(data ?? []);
  };
  useEffect(() => { load(); }, [filter]);

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

  return (
    <div>
      <PageHeader title="CRM Leads" description="Lead pipeline submitted by users from the app." />

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
              <TableHead>Follow-up</TableHead><TableHead>Deal value</TableHead>
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
                <TableCell>{r.follow_up_date}</TableCell>
                <TableCell>₹{Number(r.deal_value || 0).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No leads yet. Users submit leads from the Leadito app.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
