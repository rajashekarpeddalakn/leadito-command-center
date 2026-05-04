import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logo from "@/assets/leadito-logo.png";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
  fullName: z.string().trim().min(1).max(100).optional(),
});

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  if (loading) return null;
  if (user) return <Navigate to="/admin" replace />;

  const submit = async (mode: "in" | "up") => {
    setBusy(true);
    try {
      const parsed = schema.parse(form);
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { full_name: parsed.fullName || parsed.email },
          },
        });
        if (error) throw error;
        toast.success("Account created — signing you in…");
        navigate("/admin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: parsed.email, password: parsed.password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/admin");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-soft p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Leadito AI" className="w-20 h-20 rounded-2xl shadow-elegant mb-3" />
          <h1 className="text-3xl font-bold text-gradient">Leadito AI</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Access the Leadito admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="in">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="in">Sign in</TabsTrigger>
                <TabsTrigger value="up">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="in" className="space-y-3">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <Button className="w-full" disabled={busy} onClick={() => submit("in")}>Sign in</Button>
              </TabsContent>
              <TabsContent value="up" className="space-y-3">
                <div><Label>Full name</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <Button className="w-full" disabled={busy} onClick={() => submit("up")}>Create account</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center mt-4">
          New accounts are users by default. Promote to admin via the database for the first admin.
        </p>
      </div>
    </div>
  );
}
