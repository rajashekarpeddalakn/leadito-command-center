import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star, Loader2, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import testimonialsService from "@/service/testimonials";
import { confirmAction } from "@/lib/alerts";

const empty: any = { name: "", role: "", feedback: "", rating: 5, avatarUrl: "", isActive: true, order: 0, socialIcon: "" };

export default function TestimonialsPage() {
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
    fetchTestimonials(1, false);
  }, []);

  const fetchTestimonials = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setFetching(true);

      const data = await testimonialsService.listTestimonials({ page: pageNum, limit: 12 });

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
      toast.error("Failed to fetch testimonials");
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
          fetchTestimonials(page + 1, true);
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
    if (!editing.name || !editing.feedback) return toast.error("Name and feedback are required");

    setLoading(true);
    try {
      const payload = { ...editing, rating: Number(editing.rating) || 5, order: Number(editing.order) || 0 };

      if (editing.id) {
        await testimonialsService.updateTestimonial(editing.id, payload);
        toast.success("Testimonial updated");
      } else {
        await testimonialsService.createTestimonial(payload);
        toast.success("Testimonial created");
      }

      setOpen(false);
      setEditing(empty);
      fetchTestimonials(1, false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    const confirmed = await confirmAction({
      title: "Delete Testimonial",
      text: "Are you sure you want to remove this testimonial? This action cannot be undone.",
      confirmButtonText: "Delete",
      isDestructive: true
    });
    if (!confirmed) return;
    try {
      await testimonialsService.deleteTestimonial(id);
      toast.success("Deleted");
      fetchTestimonials(1, false);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader title="Testimonials" description={`Showcase what your clients say about your service (${pagination.totalItems} total). Optimized scroll activated.`}
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(empty)}>
                <Plus className="w-4 h-4 mr-2" />Add testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} Testimonial</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <Input type="number" min={1} max={5} value={editing.rating} onChange={e => setEditing({ ...editing, rating: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={editing.role ?? ""} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="CEO" />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea rows={4} value={editing.feedback} onChange={e => setEditing({ ...editing, feedback: e.target.value })} placeholder="Enter customer experience..." />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.isActive} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} />
                  <Label>Active</Label>
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
          <p className="animate-pulse">Loading testimonials...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((t, idx) => (
              <Card key={t.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-card border-border/40 hover:border-primary/40 transition-all duration-300 relative group" style={{ animationDelay: `${(idx % 12) * 50}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-foreground text-lg leading-none mb-1">{t.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">{t.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-warning text-warning" : "fill-muted text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <div className="relative">
                    <MessageSquareQuote className="absolute -top-2 -left-3 w-8 h-8 text-primary/5 -z-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed italic relative z-10 line-clamp-4">"{t.feedback}"</p>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t border-border/40">
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => remove(t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex-1" />
                    <Button size="sm" variant="outline" className="h-9" onClick={() => { setEditing(t); setOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </Button>
                  </div>
                  {!t.isActive && (
                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Inactive</div>
                  )}
                </CardContent>
              </Card>
            ))}
            {!items.length && (
              <Card className="col-span-full py-20 text-center border-dashed border-2 bg-accent/10">
                <div className="max-w-xs mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                    <MessageSquareQuote className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-bold text-xl mb-1">No testimonials yet</h4>
                  <p className="text-muted-foreground text-sm mb-6">Capture and display social proof from your happy customers.</p>
                  <Button onClick={() => setOpen(true)} className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" /> Add Testimonial
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
