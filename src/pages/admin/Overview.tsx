import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, MessageSquareQuote, Sparkles, BarChart3, Users, ContactRound, IndianRupee, TrendingUp, Loader2, Building2, Calendar, UserPlus } from "lucide-react";
import { toast } from "sonner";
import statsService from "@/service/stats";

function StatCard({ icon: Icon, label, value, accent, delay }: any) {
  return (
    <Card className="shadow-card border-border/60 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-0.5">{label}</p>
          <p className="text-2xl font-black tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error("Failed to fetch dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
      <div className="animate-in fade-in slide-in-from-left duration-700">
        <h1 className="text-4xl font-black tracking-tight">System Intelligence</h1>
        <p className="text-muted-foreground mt-1 font-medium">Real-time performance metrics across the Leadito AI ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Users" value={stats.users} accent="bg-primary/10 text-primary" delay={0} />
        <StatCard icon={ContactRound} label="CRM Leads" value={stats.leads} accent="bg-blue-500/10 text-blue-500" delay={50} />
        <StatCard icon={BarChart3} label="Active Ads" value={stats.ads} accent="bg-amber-500/10 text-amber-500" delay={100} />
        <StatCard icon={TrendingUp} label="Gross Revenue" value={`₹${stats.revenue.toLocaleString()}`} accent="bg-emerald-500/10 text-emerald-500" delay={150} />
        <StatCard icon={IndianRupee} label="Ad Investment" value={`₹${stats.spent.toLocaleString()}`} accent="bg-rose-500/10 text-rose-500" delay={200} />
        <StatCard icon={Video} label="Video Gallery" value={stats.videos} accent="bg-violet-500/10 text-violet-500" delay={250} />
        <StatCard icon={MessageSquareQuote} label="User Reviews" value={stats.testimonials} accent="bg-indigo-500/10 text-indigo-500" delay={300} />
        <StatCard icon={Sparkles} label="Active Services" value={stats.services} accent="bg-cyan-500/10 text-cyan-500" delay={350} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <Card className="shadow-card border-border/60 bg-card/50 overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Membership Intelligence
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-bold text-[10px] tracking-widest px-3">
                LIVE SPOTLIGHT
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {stats.activeUsers?.map((user: any) => {
                const sub = user.subscriptions?.[0];
                const plan = sub?.plan;
                return (
                  <div key={user.id} className="flex items-center justify-between p-5 hover:bg-primary/[0.02] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-xl border border-primary/10 group-hover:scale-105 transition-transform">
                        {user.name?.[0] || "M"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-[15px] tracking-tight">{user.name || user.phone}</p>
                          <Badge variant="outline" className="h-4 text-[9px] font-black tracking-tighter px-1.5 uppercase bg-background">
                            {user.city || "Pan India"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" />
                          {user.businessName || "Independent Professional"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Assigned Strategy</p>
                        <div className="flex items-center justify-end gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-bold text-[11px] h-6">
                            {plan?.name || "Premium Membership"}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right border-l pl-6 min-w-[120px]">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Contract Validity</p>
                        <div className="flex items-center justify-end gap-1.5 text-slate-700">
                          <Calendar className="w-3 h-3 text-primary/60" />
                          <span className="text-sm font-black tracking-tight">
                            {sub?.expiryDate ? new Date(sub.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Rolling"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!stats.activeUsers || stats.activeUsers.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3 opacity-50">
                  <UserPlus className="w-10 h-10" />
                  <p className="font-bold tracking-widest uppercase text-[10px]">No Active Deployments Detected</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="bg-muted/20 border-t p-3 text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Leadito AI Explorer • Real-Time Synchronization Active</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
