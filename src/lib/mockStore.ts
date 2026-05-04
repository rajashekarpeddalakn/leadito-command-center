// Frontend-only mock data store backed by localStorage.
// Provides typed collections + a tiny reactive hook so pages re-render on changes.

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "leadito_mock_db_v1";

// ---------- Types ----------
export type LeadStatus =
  | "new" | "converted" | "on_hold" | "not_interested"
  | "not_answered" | "follow_up" | "closed" | "appointment_booked";

export type User = {
  id: string; full_name: string; email: string; phone: string;
  company: string; role: "admin" | "user"; created_at: string;
};
export type Video = {
  id: string; title: string; description: string; video_url: string;
  thumbnail_url: string; is_active: boolean; display_order: number;
};
export type Testimonial = {
  id: string; name: string; role: string; company: string; content: string;
  rating: number; avatar_url: string; is_active: boolean; created_at: string;
};
export type Service = {
  id: string; title: string; description: string; icon: string;
  image_url: string; is_active: boolean; display_order: number;
};
export type Plan = {
  id: string; name: string; description: string; price: number; currency: string;
  billing_period: "monthly" | "yearly" | "one_time"; features: string[];
  is_popular: boolean; is_active: boolean; display_order: number;
};
export type AdResult = {
  id: string; user_id: string; campaign_name: string;
  period_start: string; period_end: string;
  budget_spent: number; leads: number; cost_per_lead: number;
  closed_deals: number; revenue: number; roi: number; notes: string;
  created_at: string;
};
export type Lead = {
  id: string; user_id: string; name: string; phone: string; email: string;
  source: string; status: LeadStatus; follow_up_date: string;
  deal_value: number; notes: string; created_at: string;
};

export type DB = {
  users: User[]; videos: Video[]; testimonials: Testimonial[];
  services: Service[]; plans: Plan[]; ad_results: AdResult[]; leads: Lead[];
};

// ---------- Seed ----------
const uid = () => Math.random().toString(36).slice(2, 11);
const now = () => new Date().toISOString();

const seed = (): DB => {
  const u1: User = { id: uid(), full_name: "Aarav Sharma", email: "aarav@brightads.in", phone: "+91 98765 43210", company: "Bright Ads", role: "user", created_at: now() };
  const u2: User = { id: uid(), full_name: "Priya Kapoor", email: "priya@growthly.co", phone: "+91 91234 56789", company: "Growthly", role: "user", created_at: now() };
  const u3: User = { id: uid(), full_name: "Rahul Mehta", email: "rahul@leadpro.io", phone: "+91 99887 76655", company: "LeadPro", role: "user", created_at: now() };
  const admin: User = { id: uid(), full_name: "Leadito Admin", email: "admin@leadito.ai", phone: "+91 90000 00000", company: "Leadito AI", role: "admin", created_at: now() };

  return {
    users: [admin, u1, u2, u3],
    videos: [
      { id: uid(), title: "Welcome to Leadito AI", description: "Quick intro to the platform.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail_url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600", is_active: true, display_order: 1 },
      { id: uid(), title: "How to scale paid ads", description: "Strategies that 3x'd ROAS.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600", is_active: true, display_order: 2 },
    ],
    testimonials: [
      { id: uid(), name: "Neha Singh", role: "Marketing Head", company: "Zenith Realty", content: "Leadito AI cut our cost-per-lead by 40% in 60 days. Game changer.", rating: 5, avatar_url: "", is_active: true, created_at: now() },
      { id: uid(), name: "Karan Patel", role: "Founder", company: "Nova Fitness", content: "The CRM + ad-results combo gave us total clarity over spend.", rating: 5, avatar_url: "", is_active: true, created_at: now() },
    ],
    services: [
      { id: uid(), title: "Meta Ads Management", description: "Full-funnel Facebook & Instagram campaigns.", icon: "Megaphone", image_url: "", is_active: true, display_order: 1 },
      { id: uid(), title: "Google Ads", description: "Search, Performance Max & YouTube ads.", icon: "Search", image_url: "", is_active: true, display_order: 2 },
      { id: uid(), title: "Lead CRM Setup", description: "Pipeline, automation & follow-up sequences.", icon: "ContactRound", image_url: "", is_active: true, display_order: 3 },
    ],
    plans: [
      { id: uid(), name: "Starter", description: "For solo agencies & freelancers.", price: 2999, currency: "INR", billing_period: "monthly", features: ["1 active campaign", "100 leads / month", "Email support"], is_popular: false, is_active: true, display_order: 1 },
      { id: uid(), name: "Growth", description: "Most popular for scaling brands.", price: 7999, currency: "INR", billing_period: "monthly", features: ["5 active campaigns", "1000 leads / month", "Priority support", "Advanced analytics"], is_popular: true, is_active: true, display_order: 2 },
      { id: uid(), name: "Enterprise", description: "Custom AI workflows & dedicated manager.", price: 19999, currency: "INR", billing_period: "monthly", features: ["Unlimited campaigns", "Unlimited leads", "Dedicated manager", "Custom integrations"], is_popular: false, is_active: true, display_order: 3 },
    ],
    ad_results: [
      { id: uid(), user_id: u1.id, campaign_name: "Real Estate - Q4", period_start: "2026-01-01", period_end: "2026-01-31", budget_spent: 50000, leads: 220, cost_per_lead: 227, closed_deals: 12, revenue: 480000, roi: 860, notes: "", created_at: now() },
      { id: uid(), user_id: u2.id, campaign_name: "Fitness Studio Launch", period_start: "2026-02-01", period_end: "2026-02-28", budget_spent: 30000, leads: 410, cost_per_lead: 73, closed_deals: 38, revenue: 190000, roi: 533, notes: "", created_at: now() },
      { id: uid(), user_id: u3.id, campaign_name: "B2B SaaS Demo", period_start: "2026-03-01", period_end: "2026-03-31", budget_spent: 80000, leads: 95, cost_per_lead: 842, closed_deals: 7, revenue: 350000, roi: 337, notes: "", created_at: now() },
    ],
    leads: [
      { id: uid(), user_id: u1.id, name: "Vikram Joshi", phone: "+91 98111 22233", email: "vikram@example.com", source: "Facebook", status: "converted", follow_up_date: "", deal_value: 45000, notes: "", created_at: now() },
      { id: uid(), user_id: u1.id, name: "Sana Khan", phone: "+91 99222 33344", email: "sana@example.com", source: "Instagram", status: "follow_up", follow_up_date: "2026-05-10", deal_value: 0, notes: "", created_at: now() },
      { id: uid(), user_id: u2.id, name: "Rohit Verma", phone: "+91 90011 22233", email: "rohit@example.com", source: "Google", status: "appointment_booked", follow_up_date: "2026-05-08", deal_value: 0, notes: "", created_at: now() },
      { id: uid(), user_id: u2.id, name: "Megha Iyer", phone: "+91 90099 88877", email: "megha@example.com", source: "Referral", status: "new", follow_up_date: "", deal_value: 0, notes: "", created_at: now() },
      { id: uid(), user_id: u3.id, name: "Akash Nair", phone: "+91 91111 22233", email: "akash@example.com", source: "LinkedIn", status: "on_hold", follow_up_date: "", deal_value: 0, notes: "", created_at: now() },
      { id: uid(), user_id: u3.id, name: "Ishita Roy", phone: "+91 92222 33344", email: "ishita@example.com", source: "Website", status: "not_interested", follow_up_date: "", deal_value: 0, notes: "", created_at: now() },
      { id: uid(), user_id: u1.id, name: "Manav Gupta", phone: "+91 93333 44455", email: "manav@example.com", source: "Facebook", status: "not_answered", follow_up_date: "", deal_value: 0, notes: "", created_at: now() },
      { id: uid(), user_id: u2.id, name: "Tara Bhatt", phone: "+91 94444 55566", email: "tara@example.com", source: "Instagram", status: "closed", follow_up_date: "", deal_value: 32000, notes: "", created_at: now() },
    ],
  };
};

// ---------- Storage ----------
let cache: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { cache = JSON.parse(raw); return cache!; }
  } catch {}
  cache = seed();
  persist();
  return cache;
}
function persist() {
  if (!cache) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch {}
  listeners.forEach(l => l());
}

export const db = {
  get<K extends keyof DB>(table: K): DB[K] { return load()[table]; },
  set<K extends keyof DB>(table: K, rows: DB[K]) { load(); cache![table] = rows; persist(); },
  insert<K extends keyof DB>(table: K, row: Partial<DB[K][number]>) {
    const r: any = { id: uid(), created_at: now(), ...row };
    load(); (cache![table] as any[]).push(r); persist(); return r;
  },
  update<K extends keyof DB>(table: K, id: string, patch: Partial<DB[K][number]>) {
    load();
    cache![table] = (cache![table] as any[]).map((r: any) => r.id === id ? { ...r, ...patch } : r) as any;
    persist();
  },
  remove<K extends keyof DB>(table: K, id: string) {
    load();
    cache![table] = (cache![table] as any[]).filter((r: any) => r.id !== id) as any;
    persist();
  },
  reset() { cache = seed(); persist(); },
};

export function useTable<K extends keyof DB>(table: K): DB[K] {
  const [, tick] = useState(0);
  const subscribe = useCallback(() => tick(t => t + 1), []);
  useEffect(() => { listeners.add(subscribe); return () => { listeners.delete(subscribe); }; }, [subscribe]);
  return db.get(table);
}
