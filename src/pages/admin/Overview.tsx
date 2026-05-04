import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, MessageSquareQuote, Sparkles, BarChart3, Users, ContactRound, IndianRupee, TrendingUp } from "lucide-react";
import { useTable } from "@/lib/mockStore";

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
  const users = useTable("users");
  const videos = useTable("videos");
  const testimonials = useTable("testimonials");
  const services = useTable("services");
  const leads = useTable("leads");
  const ads = useTable("ad_results");

  const revenue = ads.reduce((s, r) => s + Number(r.revenue || 0), 0);
  const spent = ads.reduce((s, r) => s + Number(r.budget_spent || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back to Leadito AI admin control center.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Users" value={users.length} accent="bg-primary/10 text-primary" />
        <StatCard icon={ContactRound} label="CRM Leads" value={leads.length} accent="bg-info/10 text-info" />
        <StatCard icon={BarChart3} label="Ad Campaigns" value={ads.length} accent="bg-warning/10 text-warning" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${revenue.toLocaleString()}`} accent="bg-success/10 text-success" />
        <StatCard icon={IndianRupee} label="Total Spend" value={`₹${spent.toLocaleString()}`} accent="bg-destructive/10 text-destructive" />
        <StatCard icon={Video} label="Videos" value={videos.length} accent="bg-primary/10 text-primary" />
        <StatCard icon={MessageSquareQuote} label="Testimonials" value={testimonials.length} accent="bg-accent text-accent-foreground" />
        <StatCard icon={Sparkles} label="Services" value={services.length} accent="bg-primary/10 text-primary" />
      </div>
      <Card className="shadow-card">
        <CardHeader><CardTitle>Quick Tips</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Use the sidebar to manage videos, testimonials, services, plans, ad results, CRM leads and users.</p>
          <p>• All edits are saved in your browser (localStorage). Click <strong>Reset demo data</strong> in the top bar to restore the seed.</p>
          <p>• Ad results and CRM leads are scoped per user — pick a user to view or edit their data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
