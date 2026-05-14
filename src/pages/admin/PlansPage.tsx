import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Check, Loader2, Package, Link, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import plansService from "@/service/plans";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { confirmAction } from "@/lib/alerts";
import api from "@/service/api";

const empty: any = {
  name: "",
  price: 0,
  durationDays: 30,
  adBudget: "",
  expectedLeads: "",
  features: "",
  isActive: true,
  paymentLink: "",
  highlightTag: "None"
};

const TAG_OPTIONS = [
  "None",
  "Most Popular",
  "Festival Offer",
  "Limited Offer",
  "Recommended",
  "Trial Offer"
];

export default function PlansPage() {
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
    fetchPlans(1, false);
  }, []);

  const fetchPlans = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setFetching(true);

      const data = await plansService.listPlans({ page: pageNum, limit: 12 });

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
      toast.error("Failed to fetch plans");
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
          fetchPlans(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetching, loadingMore, page, pagination.totalPages]);

  const openEdit = (p?: any) => {
    if (p) {
      setEditing({
        ...p,
        features: Array.isArray(p.features)
          ? p.features.map((f: any) => typeof f === 'string' ? f : f?.text).join("\n")
          : (typeof p.features === 'string' ? JSON.parse(p.features || '[]').map((f: any) => typeof f === 'string' ? f : f?.text).join("\n") : "")
      });
    } else {
      setEditing(empty);
    }
    setOpen(true);
  };

  const save = async () => {
    if (!editing.name || editing.price === undefined) return toast.error("Name and Price are required");

    setLoading(true);
    try {
      const features = String(editing.features || "")
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);

      const payload = {
        ...editing,
        price: Number(editing.price) || 0,
        durationDays: Number(editing.durationDays) || 30,
        features
      };

      if (editing.id) {
        await plansService.updatePlan(editing.id, payload);
        toast.success("Plan updated successfully");
      } else {
        await plansService.createPlan(payload);
        toast.success("Plan created successfully");
      }

      setOpen(false);
      setEditing(empty);
      fetchPlans(1, false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    const confirmed = await confirmAction({
      title: "Delete Subscription Plan",
      text: "Are you sure you want to delete this plan? Members currently on this plan will not be affected until their next renewal.",
      confirmButtonText: "Delete Plan",
      isDestructive: true
    });
    if (!confirmed) return;
    try {
      await plansService.deletePlan(id);
      toast.success("Plan deleted");
      fetchPlans(1, false);
    } catch (error) {
      toast.error("Failed to delete plan");
    }
  };

  const togglePlanStatus = async (plan: any, isLive: boolean) => {
    try {
      // Create a clean payload for status update
      const payload = {
        ...plan,
        isActive: isLive,
        // Ensure features are correctly formatted for the backend update
        features: Array.isArray(plan.features) ? plan.features.map((f: any) => typeof f === 'string' ? f : f?.text) : []
      };

      await plansService.updatePlan(plan.id, payload);
      toast.success(`Plan ${isLive ? 'Published' : 'Hidden'} successfully`);

      // Update local state for instant feedback without full re-fetch if possible
      setItems(prev => prev.map(item => item.id === plan.id ? { ...item, isActive: isLive } : item));
    } catch (error) {
      toast.error("Failed to update plan status");
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <PageHeader title="Plans & Pricing" description={`Manage subscription tiers and pricing plans (${pagination.totalItems} total). Optimized scroll activated.`}
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
            <DialogTrigger asChild>
              <Button onClick={() => openEdit()} className="font-bold rounded-lg h-10">
                <Plus className="w-4 h-4 mr-2" />Add plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} Plan</DialogTitle></DialogHeader>
              <div className="space-y-3 py-1">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Plan Name</Label>
                    <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Pro" className="h-8 text-xs font-medium" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Price (₹)</Label>
                    <Input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} className="h-8 text-xs font-medium" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Duration (Days)</Label>
                    <Input type="number" value={editing.durationDays} onChange={e => setEditing({ ...editing, durationDays: e.target.value })} className="h-8 text-xs font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Ad Budget</Label>
                    <Input value={editing.adBudget ?? ""} onChange={e => setEditing({ ...editing, adBudget: e.target.value })} placeholder="e.g. 50k" className="h-8 text-xs font-medium" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Expected Leads</Label>
                    <Input value={editing.expectedLeads ?? ""} onChange={e => setEditing({ ...editing, expectedLeads: e.target.value })} placeholder="e.g. 50-100" className="h-8 text-xs font-medium" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-primary">Highlight Tag</Label>
                    <Select value={editing.highlightTag || "None"} onValueChange={(v) => setEditing({ ...editing, highlightTag: v })}>
                      <SelectTrigger className="h-8 text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAG_OPTIONS.map(tag => <SelectItem key={tag} value={tag} className="text-xs">{tag}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Features (one per line)</Label>
                    <Textarea rows={2} value={editing.features} onChange={e => setEditing({ ...editing, features: e.target.value })} placeholder="Verified Leads&#10;CRM Access" className="text-xs font-medium resize-none min-h-[60px]" />
                  </div>
                  <div className="col-span-4 flex flex-col justify-center gap-2 pt-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={editing.isActive} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} className="scale-75" />
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Active</Label>
                    </div>
                    <p className="text-[8px] text-muted-foreground italic leading-tight">Controls visibility in mobile app.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-primary flex items-center gap-1.5">
                    <Link className="w-3 h-3" /> Razorpay Link
                  </Label>
                  <Input
                    value={editing.paymentLink ?? ""}
                    onChange={e => setEditing({ ...editing, paymentLink: e.target.value })}
                    placeholder="https://rzp.io/rzp/..."
                    className="h-8 text-xs font-bold border-primary/20 bg-primary/5 focus:bg-background transition-colors"
                  />
                </div>
              </div>
              <DialogFooter className="bg-muted/30 -mx-6 -mb-6 px-6 py-4 mt-4">
                <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="font-bold h-9">Cancel</Button>
                <Button onClick={save} disabled={loading} className="font-bold px-8 h-9">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing.id ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {fetching ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground" >
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
          <p className="animate-pulse text-sm font-medium">Synchronizing pricing tiers...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p, idx) => (
              <Card key={p.id} className={`animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm border-border/40 hover:border-primary/30 transition-all duration-300 relative group overflow-hidden rounded-xl bg-card ${p.price > 10000 ? "ring-2 ring-primary/10 border-primary/20" : ""}`} style={{ animationDelay: `${(idx % 12) * 50}ms` }}>
                {!p.isActive && (
                  <div className="absolute top-0 left-0 right-0 bottom-[64px] bg-background/60 backdrop-blur-[1px] z-20 flex items-center justify-center pointer-events-none">
                    <Badge variant="destructive" className="font-bold px-4 py-1 uppercase tracking-widest text-[10px] shadow-lg pointer-events-auto">Hidden</Badge>
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="p-6 pb-4 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold tracking-tight text-foreground/90 uppercase leading-tight line-clamp-2 min-h-[1.5rem]">{p.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tighter">₹{p.price}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{p.durationDays} Days</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border border-border/30">
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Ad Budget</p>
                        <p className="text-xs font-bold text-foreground/80">{p.adBudget || "Flexible"}</p>
                      </div>
                      <div className="space-y-0.5 border-l border-border/40 pl-3">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Expected Leads</p>
                        <p className="text-xs font-bold text-foreground/80">{p.expectedLeads || "Custom"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 space-y-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Included Features</p>
                    <ul className="space-y-2">
                      {(Array.isArray(p.features) ? p.features : []).map((f: any, i: number) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-[12px] font-medium text-muted-foreground/90 leading-tight break-words flex-1">
                            {typeof f === 'string' ? f : f?.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-muted/20 border-t flex items-center justify-between mt-2 relative z-30">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 border-r border-border/60 pr-2 mr-0.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => remove(p.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:bg-accent" onClick={() => openEdit(p)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={p.isActive}
                          onCheckedChange={(val) => togglePlanStatus(p, val)}
                          className="scale-[0.6] origin-left"
                        />
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${p.isActive ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {p.isActive ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-bold text-muted-foreground/40 border-muted-foreground/10 italic">ID #{p.id}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!items.length && (
              <Card className="col-span-full py-20 text-center border-dashed border-2 bg-muted/10 rounded-2xl">
                <div className="max-w-xs mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-background shadow-sm border flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h4 className="font-bold text-lg mb-1">No billing tiers configured</h4>
                  <p className="text-muted-foreground text-xs mb-8">Setup your pricing structure to allow members to subscribe.</p>
                  <Button onClick={() => openEdit()} size="lg" className="rounded-xl font-bold px-8">
                    <Plus className="w-4 h-4 mr-2" /> Define First Plan
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
    </div >
  );
}
