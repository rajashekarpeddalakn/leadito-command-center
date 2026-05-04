import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

type Video = { id: string; title: string; description: string | null; video_url: string; thumbnail_url: string | null; is_active: boolean; display_order: number };

const empty = { title: "", description: "", video_url: "", thumbnail_url: "", is_active: true, display_order: 0 };

export default function VideosPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  const load = async () => {
    const { data, error } = await supabase.from("videos").select("*").order("display_order");
    if (error) toast.error(error.message); else setItems(data as any);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title || !editing.video_url) return toast.error("Title and video URL required");
    const payload = { ...editing, display_order: Number(editing.display_order) || 0 };
    const { error } = editing.id
      ? await supabase.from("videos").update(payload).eq("id", editing.id)
      : await supabase.from("videos").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <PageHeader title="Videos" description="Add and manage marketing videos shown in the app."
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild><Button onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-2" />Add video</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} video</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
                <div><Label>Video URL (YouTube embed or mp4)</Label><Input value={editing.video_url} onChange={e => setEditing({ ...editing, video_url: e.target.value })} /></div>
                <div><Label>Thumbnail URL</Label><Input value={editing.thumbnail_url ?? ""} onChange={e => setEditing({ ...editing, thumbnail_url: e.target.value })} /></div>
                <div className="flex items-center gap-4">
                  <div className="flex-1"><Label>Display order</Label><Input type="number" value={editing.display_order} onChange={e => setEditing({ ...editing, display_order: e.target.value })} /></div>
                  <div className="flex items-center gap-2 pt-6"><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>Active</Label></div>
                </div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(v => (
          <Card key={v.id} className="shadow-card overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {v.thumbnail_url ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Play className="w-10 h-10 text-muted-foreground" /></div>}
              {!v.is_active && <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded">Inactive</span>}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{v.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{v.description}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => { setEditing(v); setOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => remove(v.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && <Card className="col-span-full p-10 text-center text-muted-foreground">No videos yet.</Card>}
      </div>
    </div>
  );
}
