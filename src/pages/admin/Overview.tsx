import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, MessageSquareQuote, Sparkles, BarChart3, Users, ContactRound, IndianRupee, TrendingUp } from "lucide-react";

function StatCard({ icon: Icon, label, value, accent }: any) {
  return (
    <Card className="shadow-card border-border/60 hover:shadow-elegant transition-shadow">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Overview() {
  const [stats, setStats] = useState({ users: 0, videos: 0, testimonials: 0, services: 0, leads: 0, ads: 0, revenue: 0, spent: 0 });

  useEffect(() => {
    (async () => {
      const [u, v, t, s, l, a] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("videos").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("ad_results").select("revenue,budget_spent"),
      ]);
      const revenue = (a.data ?? []).reduce((s: number, r: any) => s + Number(r.revenue || 0), 0);
      const spent = (a.data ?? []).reduce((s: number, r: any) => s + Number(r.budget_spent || 0), 0);
      setStats({
        users: u.count ?? 0, videos: v.count ?? 0, testimonials: t.count ?? 0,
        services: s.count ?? 0, leads: l.count ?? 0, ads: a.data?.length ?? 0,
        revenue, spent,
      });
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back to Leadito AI admin control center.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Users" value={stats.users} accent="bg-primary/10 text-primary" />
        <StatCard icon={ContactRound} label="CRM Leads" value={stats.leads} accent="bg-info/10 text-info" />
        <StatCard icon={BarChart3} label="Ad Campaigns" value={stats.ads} accent="bg-warning/10 text-warning" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} accent="bg-success/10 text-success" />
        <StatCard icon={IndianRupee} label="Total Spend" value={`₹${stats.spent.toLocaleString()}`} accent="bg-destructive/10 text-destructive" />
        <StatCard icon={Video} label="Videos" value={stats.videos} accent="bg-primary/10 text-primary" />
        <StatCard icon={MessageSquareQuote} label="Testimonials" value={stats.testimonials} accent="bg-accent text-accent-foreground" />
        <StatCard icon={Sparkles} label="Services" value={stats.services} accent="bg-primary/10 text-primary" />
      </div>
      <Card className="shadow-card">
        <CardHeader><CardTitle>Quick Tips</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Use the sidebar to manage videos, testimonials, services, plans, ad results, CRM leads and users.</p>
          <p>• All marketing content (videos, testimonials, services, plans) is stored centrally and visible to all signed-in users.</p>
          <p>• Ad results and CRM leads are scoped per user — pick a user to view or edit their data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
