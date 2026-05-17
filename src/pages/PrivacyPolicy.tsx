import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-4 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group font-medium">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">Privacy Policy</h1>
                        <p className="text-muted-foreground mt-2 font-medium italic">Last updated: May 17, 2024</p>
                    </div>
                    <div className="hidden sm:flex w-16 h-16 rounded-[2rem] bg-white shadow-xl shadow-primary/10 items-center justify-center text-primary border border-primary/5">
                        <Shield className="w-8 h-8" />
                    </div>
                </div>

                <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white">
                    <CardContent className="p-8 md:p-12 space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">1. Introduction</h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                This Privacy Policy explains how Leadito (“we”, “our”, “us”) collects, uses, stores, and protects your information when you use our services, website, or application (“Services”). By using our Services, you agree to this Privacy Policy.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">2. Information We Collect</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-2">a) Personal Information</h3>
                                    <p className="text-slate-500 text-sm mb-3 font-semibold uppercase tracking-wider">We may collect:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 font-medium">
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Name</li>
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Phone number</li>
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Email address</li>
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Business name and details</li>
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Billing and payment information</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800 mb-2">b) Usage Data</h3>
                                    <p className="text-slate-500 text-sm mb-3 font-semibold uppercase tracking-wider">We may collect:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 font-medium">
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Device information (IP address, browser, etc)</li>
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">App usage data (logins, activity)</li>
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Campaign performance data</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800 mb-2">c) Lead Data</h3>
                                    <p className="text-slate-500 text-sm mb-3 font-semibold uppercase tracking-wider">We may collect and process:</p>
                                    <ul className="grid grid-cols-1 gap-2 text-slate-600 font-medium">
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Information of leads generated through advertising campaigns</li>
                                        <li className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">CRM-related data used within our platform</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">3. How We Use Your Information</h2>
                            <ul className="space-y-2 text-slate-600 font-medium bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">
                                <li>• Provide and manage our services</li>
                                <li>• Run and optimize advertising campaigns</li>
                                <li>• Create and manage marketing content</li>
                                <li>• Communicate with you (updates, reports, support)</li>
                                <li>• Improve our platform and services</li>
                                <li>• Process payments</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">4. Social Media Account Access</h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                To provide our services, we may require access to your social media accounts, including Facebook and Instagram. Clients are required to provide authorized access (such as Meta Business Manager permissions) to their advertising accounts.
                                <span className="block mt-4 text-primary font-bold">We do not request or store personal login passwords.</span>
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">5. Advertising & Platform Dependencies</h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Our services depend on third-party advertising platforms such as Facebook and Instagram (Meta). Ad performance and approvals are subject to their policies and systems.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">6. Data Sharing</h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                We do not sell or misuse your personal data. We may share information only with trusted third parties required for service delivery: Advertising platforms (Meta/Facebook/Instagram), Payment providers, and Hosting services.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">7. Data Protection & Security</h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                We implement reasonable technical and organizational measures to protect your data. However, no system can guarantee 100% security.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">14. Contact Us</h2>
                            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-slate-700 font-bold mb-1">For any privacy-related queries, please contact:</p>
                                <a href="mailto:support@leadito.com" className="text-primary font-black hover:underline">support@leadito.com</a>
                            </div>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
