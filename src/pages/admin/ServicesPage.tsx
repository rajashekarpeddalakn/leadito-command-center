import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Sparkles, Loader2, Layers } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import platformServices from "@/service/services";
import { confirmAction } from "@/lib/alerts";

const empty: any = { title: "", description: "", iconUrl: "", isActive: true, order: 0 };

export default function ServicesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServices(1, false);
  }, []);

  const fetchServices = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setFetching(true);

      const data = await platformServices.listServices({ page: pageNum, limit: 12 });

      const newItems = data.items || [];
      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      const pag = data.pagination || { totalPages: 1, totalItems: 0 };
      setPagination(pag);
      setHasMore(pageNum < pag.totalPages);
      setPage(pageNum);
    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setFetching(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !fetching && !loadingMore && page < pagination.totalPages) {
          fetchServices(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetching, loadingMore, page, pagination.totalPages]);

  const save = async () => {
    if (!editing.title || !editing.description || !editing.iconUrl) return toast.error("Title, Description and Icon URL are required");

    setLoading(true);
    try {
      const payload = { ...editing, order: Number(editing.order) || 0 };

      if (editing.id) {
        await platformServices.updateService(editing.id, payload);
        toast.success("Service updated");
      } else {
        await platformServices.createService(payload);
        toast.success("Service created");
      }

      setOpen(false);
      setEditing(empty);
      fetchServices(1, false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    const confirmed = await confirmAction({
      title: "Delete Service",
      text: "Are you sure you want to remove this service from the platform list?",
      confirmButtonText: "Delete",
      isDestructive: true
    });
    if (!confirmed) return;
    try {
      await platformServices.deleteService(id);
      toast.success("Deleted");
      fetchServices(1, false);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader title="Platform Services" description={`Manage the key services shown in the Leadito AI application (${pagination.totalItems} total). Optimized scroll activated.`}
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(empty)}>
                <Plus className="w-4 h-4 mr-2" />Add service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} Service</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Lead Management" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={3} value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Briefly explain the service..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch checked={editing.isActive} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} />
                    <Label>Active</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Icon URL</Label>
                  <Input value={editing.iconUrl ?? ""} onChange={e => setEditing({ ...editing, iconUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                <Button onClick={save} disabled={loading} className="gradient-primary border-0">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing.id ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {fetching ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
          <p className="animate-pulse">Loading services...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((s, idx) => (
              <Card key={s.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-card border-border/40 hover:border-primary/40 transition-all duration-300 relative group overflow-hidden" style={{ animationDelay: `${(idx % 12) * 50}ms` }}>
                {!s.isActive && (
                  <div className="absolute top-0 left-0 w-full h-full bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-bold uppercase py-1 px-3 rounded-full">Inactive</span>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                    {s.iconUrl ? (
                      <img src={s.iconUrl} alt={s.title} className="w-8 h-8 object-contain" />
                    ) : (
                      <Sparkles className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px] leading-relaxed italic">
                    "{s.description}"
                  </p>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => remove(s.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(s); setOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest bg-accent px-2 py-1 rounded">Order {s.order}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!items.length && (
              <Card className="col-span-full py-20 text-center border-dashed border-2 bg-accent/10">
                <div className="max-w-xs mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-bold text-xl mb-1">No services yet</h4>
                  <p className="text-muted-foreground text-sm mb-6">Start adding the services your platform provides.</p>
                  <Button onClick={() => setOpen(true)} className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Service
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Scroll Target Sentinel */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center w-full">
            {loadingMore && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loading more content...</span>
              </div>
            )}
            {!hasMore && items.length > 0 && (
              <div className="flex flex-col items-center gap-2 opacity-40">
                <div className="h-px w-20 bg-border" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">End of Collection</span>
                <div className="h-px w-20 bg-border" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
