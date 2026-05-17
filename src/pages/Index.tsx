import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ContactRound, Sparkles } from "lucide-react";
import logo from "@/assets/leadito-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen gradient-soft">
      <header className="container flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Leadito AI logo" className="w-10 h-10 rounded-xl shadow-card" />
          <span className="font-bold text-lg">Leadito AI</span>
        </div>
        <Link to="/admin"><Button variant="outline">Open admin</Button></Link>
      </header>

      <main className="container py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Lead Generation
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
          Run your <span className="text-gradient">digital marketing</span><br />command center
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Manage videos, testimonials, services, plans, ad results and CRM leads — all from one beautiful Leadito AI admin dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/admin"><Button size="lg" className="gradient-primary border-0 shadow-elegant">Open dashboard <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-20 max-w-4xl mx-auto text-left">
          {[
            { icon: BarChart3, title: "Ad Performance", desc: "Track budget, leads, CPL, ROI per user." },
            { icon: ContactRound, title: "CRM Pipeline", desc: "Leads, conversions, follow-ups in one view." },
            { icon: Sparkles, title: "Dynamic Content", desc: "Update videos, testimonials, services live." },
          ].map((f) => (
            <div key={f.title} className="bg-card p-6 rounded-2xl shadow-card border border-border/60">
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="container border-t border-border/40 py-10 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-60">
            <img src={logo} alt="Leadito AI logo" className="w-8 h-8 rounded-lg grayscale" />
            <span className="font-bold text-sm tracking-tight italic">Leadito AI</span>
          </div>

          <div className="flex items-center gap-8">
            <Link to="/privacy" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-amber-600 transition-colors">Terms & Conditions</Link>
          </div>

          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">
            © 2024 Leadito. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
