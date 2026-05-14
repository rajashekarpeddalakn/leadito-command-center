import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, MessageSquareQuote, Sparkles, BarChart3, Users, ContactRound, IndianRupee, TrendingUp, Loader2, Building2, Calendar, UserPlus, CreditCard, Zap, AlertCircle, Settings2, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import statsService from "@/service/stats";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function StatCard({ icon: Icon, label, value, accent, delay }: any) {
  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)] transition-all duration-500 hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-6 rounded-[24px]" style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute top-0 left-0 w-1 h-full ${accent} opacity-20`} />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className={`w-2 h-2 rounded-full ${accent} animate-pulse`} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</p>
          <p className="text-3xl font-black tracking-tight text-slate-900 leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualData, setManualData] = useState({
    pending: "",
    week: "",
    activeAds: ""
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getDashboardStats();
        setStats(data);
        setManualData({
          pending: data.manualPendingRenewals || "",
          week: data.manualRenewalsThisWeek || "",
          activeAds: data.manualActiveAds || ""
        });
      } catch (error) {
        toast.error("Failed to fetch dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSaveManual = async () => {
    setSaving(true);
    try {
      await Promise.all([
        statsService.updateManualRevenue({ key: 'MANUAL_PENDING_RENEWALS', value: manualData.pending }),
        statsService.updateManualRevenue({ key: 'MANUAL_RENEWALS_THIS_WEEK', value: manualData.week }),
        statsService.updateManualRevenue({ key: 'MANUAL_ACTIVE_ADS', value: manualData.activeAds })
      ]);
      toast.success("All overrides synchronized");
      setOpen(false);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error("Failed to update overrides");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="animate-pulse font-medium tracking-widest uppercase text-[10px]">Assembling Dashboard Analytics...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="animate-in fade-in slide-in-from-left duration-700 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">System Intelligence</h1>
          <p className="text-muted-foreground mt-1 font-medium">Real-time performance metrics across the Leadito AI ecosystem.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold gap-2 h-10 px-4 group shadow-sm transition-all hover:scale-105 active:scale-95">
            <Settings2 className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            Override Stats
          </Button>
        </div>
      </div>

      {/* Manual Override Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-0 rounded-[2rem] overflow-hidden bg-white animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-transparent border-b pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-black tracking-tight">Financial Override</CardTitle>
              </div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Manually adjust dashboard revenue figures</p>
            </CardHeader>
            <CardContent className="space-y-4 p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Pending Renewals</Label>
                  <Input
                    type="number"
                    value={manualData.pending}
                    onChange={e => setManualData({ ...manualData, pending: e.target.value })}
                    className="h-10 rounded-xl font-bold border-primary/10 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Due This Week</Label>
                  <Input
                    type="number"
                    value={manualData.week}
                    onChange={e => setManualData({ ...manualData, week: e.target.value })}
                    className="h-10 rounded-xl font-bold border-primary/10 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Active Ads</Label>
                <Input
                  type="number"
                  value={manualData.activeAds}
                  onChange={e => setManualData({ ...manualData, activeAds: e.target.value })}
                  placeholder="e.g. 15"
                  className="h-10 rounded-xl font-bold border-primary/10 focus:ring-primary/20 w-full"
                />
              </div>

              <p className="text-[9px] text-muted-foreground italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-primary uppercase mr-1">Note:</span>
                Empty fields will revert to automatic calculations based on subscription history.
              </p>
            </CardContent>
            <div className="bg-muted/30 border-t p-4 flex gap-3">
              <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1 font-bold h-11 rounded-xl">Cancel</Button>
              <Button onClick={handleSaveManual} disabled={saving} className="flex-1 font-black bg-primary text-white h-11 rounded-xl shadow-lg shadow-primary/20 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Sync Figures
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Row 1 */}
        <StatCard icon={Users} label="Total Users" value={stats.users} accent="bg-primary/10 text-primary" delay={0} />
        <StatCard icon={Zap} label="Active Paid Clients" value={stats.activePaidClients} accent="bg-emerald-500/10 text-emerald-600" delay={50} />
        <StatCard icon={UserPlus} label="Free Tier Leads" value={stats.freeUsers} accent="bg-blue-500/10 text-blue-600" delay={100} />
        <StatCard icon={AlertCircle} label="Expired Users" value={stats.expiredUsers} accent="bg-rose-500/10 text-rose-600" delay={150} />
        <StatCard icon={ContactRound} label="CRM Leads" value={stats.leads} accent="bg-violet-500/10 text-violet-600" delay={200} />

        {/* Row 2 */}
        <StatCard icon={BarChart3} label="Active Ads" value={stats.ads} accent="bg-slate-500/10 text-slate-600" delay={250} />
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${stats.totalSubscriptionRevenue?.toLocaleString()}`} accent="bg-amber-500/10 text-amber-600" delay={300} />
        <StatCard icon={TrendingUp} label="Monthly Revenue" value={`₹${stats.monthlySubscriptionRevenue?.toLocaleString()}`} accent="bg-indigo-500/10 text-indigo-600" delay={350} />

        <StatCard
          icon={RefreshCw}
          label="Pending Renewals"
          value={stats.pendingRenewals}
          accent="bg-orange-500/10 text-orange-600"
          delay={400}
        />
        <StatCard
          icon={Calendar}
          label="Renewal Due This Week"
          value={stats.renewalsThisWeek}
          accent="bg-cyan-500/10 text-cyan-600"
          delay={450}
        />
      </div>
    </div>
  );
}
