import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, Gavel, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsConditions() {
    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-4 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group font-medium">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">Terms & Conditions</h1>
                        <p className="text-muted-foreground mt-2 font-medium italic">Last updated: May 17, 2024</p>
                    </div>
                    <div className="hidden sm:flex w-16 h-16 rounded-[2rem] bg-white shadow-xl shadow-amber-500/10 items-center justify-center text-amber-600 border border-amber-500/5">
                        <Gavel className="w-8 h-8" />
                    </div>
                </div>

                <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white">
                    <CardContent className="p-8 md:p-12 space-y-12">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white text-sm">1</span>
                                Acceptance of Terms
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium pl-11">
                                By accessing or using Leadito services, website, or application, you agree to be bound by these Terms & Conditions.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white text-sm">2</span>
                                Services
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                                {[
                                    "Digital advertising services",
                                    "Lead generation campaigns",
                                    "Creative support",
                                    "Performance tracking dashboard"
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <CheckCircle2 className="w-5 h-5 text-amber-600" />
                                        <span className="font-bold text-slate-700 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white text-sm">3</span>
                                Payment & Commitment
                            </h2>
                            <div className="bg-amber-50 border border-amber-200/50 p-6 rounded-[2rem] ml-11 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Mandatory Commitment</h3>
                                        <p className="text-slate-600 text-sm font-medium mt-1">All services are offered under a mandatory 3-month commitment regardless of the selected plan.</p>
                                    </div>
                                </div>
                                <p className="font-bold text-amber-900 text-lg">₹15,000 Upfront <span className="text-sm font-medium text-amber-700 block">Or plan-specific prepayments before activation.</span></p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white text-sm">4</span>
                                Lead Generation Disclaimer
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium pl-11 italic">
                                We commit to running and optimizing campaigns using proven strategies. However, lead quantity and quality may vary depending on business niche, market demand, and competition. <span className="font-bold text-slate-900">We do not guarantee a fixed number of leads.</span>
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white text-sm">5</span>
                                No Guarantee of ROI
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium pl-11 italic">
                                Leadito does not guarantee sales, revenue, or ROI. Results depend on the client's pricing, follow-up process, and market conditions.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white text-sm">10</span>
                                Cancellation Policy
                            </h2>
                            <div className="ml-11 p-6 bg-rose-50 border border-rose-100 rounded-2xl">
                                <p className="text-rose-900 font-bold">Minimum commitment is 3 months. Early cancellation is not allowed, and no refunds are issued after service initiation.</p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white text-sm">15</span>
                                Governing Law
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium pl-11 italic">
                                These Terms shall be governed by the laws of India.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
