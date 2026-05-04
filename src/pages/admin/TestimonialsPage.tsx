import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

const empty = { name: "", role: "", company: "", content: "", rating: 5, avatar_url: "", is_active: true };

export default function TestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  const load = async () => {
    const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name || !editing.content) return toast.error("Name and content required");
    const payload = { ...editing, rating: Number(editing.rating) || 5 };
    const { error } = editing.id
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <PageHeader title="Testimonials" description="Showcase what your clients say."
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild><Button onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-2" />Add testimonial</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} testimonial</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
                  <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={editing.rating} onChange={e => setEditing({ ...editing, rating: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Role</Label><Input value={editing.role ?? ""} onChange={e => setEditing({ ...editing, role: e.target.value })} /></div>
                  <div><Label>Company</Label><Input value={editing.company ?? ""} onChange={e => setEditing({ ...editing, company: e.target.value })} /></div>
                </div>
                <div><Label>Content</Label><Textarea rows={4} value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} /></div>
                <div><Label>Avatar URL</Label><Input value={editing.avatar_url ?? ""} onChange={e => setEditing({ ...editing, avatar_url: e.target.value })} /></div>
                <div className="flex items-center gap-2"><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>Active</Label></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(t => (
          <Card key={t.id} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold">{t.name[0]}</div>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} {t.company && `· ${t.company}`}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-4">"{t.content}"</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => remove(t.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && <Card className="col-span-full p-10 text-center text-muted-foreground">No testimonials yet.</Card>}
      </div>
    </div>
  );
}
