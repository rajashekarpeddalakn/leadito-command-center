import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

const empty = { name: "", description: "", price: 0, currency: "INR", billing_period: "monthly", features: "", is_popular: false, is_active: true, display_order: 0 };

export default function PlansPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  const load = async () => {
    const { data, error } = await supabase.from("plans").select("*").order("display_order");
    if (error) toast.error(error.message); else setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (p?: any) => {
    if (p) setEditing({ ...p, features: Array.isArray(p.features) ? p.features.join("\n") : "" });
    else setEditing(empty);
    setOpen(true);
  };

  const save = async () => {
    if (!editing.name) return toast.error("Name required");
    const features = String(editing.features || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
    const payload = { ...editing, price: Number(editing.price) || 0, display_order: Number(editing.display_order) || 0, features };
    const { error } = editing.id
      ? await supabase.from("plans").update(payload).eq("id", editing.id)
      : await supabase.from("plans").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <PageHeader title="Plans & Pricing" description="Subscription tiers shown in the app."
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild><Button onClick={() => openEdit()}><Plus className="w-4 h-4 mr-2" />Add plan</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} plan</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Price</Label><Input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} /></div>
                  <div><Label>Currency</Label><Input value={editing.currency} onChange={e => setEditing({ ...editing, currency: e.target.value })} /></div>
                  <div>
                    <Label>Period</Label>
                    <Select value={editing.billing_period} onValueChange={(v) => setEditing({ ...editing, billing_period: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one_time">One time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Features (one per line)</Label><Textarea rows={5} value={editing.features} onChange={e => setEditing({ ...editing, features: e.target.value })} /></div>
                <div className="flex gap-6 items-center">
                  <div className="flex items-center gap-2"><Switch checked={editing.is_popular} onCheckedChange={(v) => setEditing({ ...editing, is_popular: v })} /><Label>Popular</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>Active</Label></div>
                  <div className="flex-1"><Label>Order</Label><Input type="number" value={editing.display_order} onChange={e => setEditing({ ...editing, display_order: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(p => (
          <Card key={p.id} className={`shadow-card relative ${p.is_popular ? "ring-2 ring-primary" : ""}`}>
            {p.is_popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Crown className="w-3 h-3" />POPULAR</div>}
            <CardContent className="p-6">
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
              <div className="my-4">
                <span className="text-4xl font-bold text-gradient">{p.currency === "INR" ? "₹" : "$"}{p.price}</span>
                <span className="text-muted-foreground text-sm">/{p.billing_period}</span>
              </div>
              <ul className="space-y-2 mb-4">
                {(Array.isArray(p.features) ? p.features : []).map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => remove(p.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && <Card className="col-span-full p-10 text-center text-muted-foreground">No plans yet.</Card>}
      </div>
    </div>
  );
}
