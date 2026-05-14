import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { AlertCircle, Eye, Loader2, CheckCircle2 } from "lucide-react";
import usersService from "@/service/users";
import { confirmAction } from "@/lib/alerts";

export default function PendingPaymentsPage() {
    const [pendingSubs, setPendingSubs] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            setFetching(true);
            const data = await usersService.listPendingSubscriptions();
            setPendingSubs(data);
        } catch (error) {
            toast.error("Failed to load pending subscriptions");
        } finally {
            setFetching(false);
        }
    };

    const handleApprove = async (sub: any) => {
        const confirmed = await confirmAction({
            title: "Confirm Approval",
            text: `Approve payment for ${sub.user?.name}? This will activate their ${sub.plan?.name} plan.`,
            confirmButtonText: "Yes, Approve",
        });

        if (confirmed) {
            try {
                await usersService.approveSubscription(sub.id);
                toast.success("Subscription approved and user activated!");
                fetchPending();
            } catch (e: any) {
                toast.error(e.response?.data?.message || "Approval failed");
            }
        }
    };

    return (
        <div className="animate-fade-in pb-10 max-w-[1400px] mx-auto">
            <PageHeader
                title="Pending Approvals"
                description="Verify manual Razorpay payments and activate user subscriptions."
            />

            <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Manual Payment Requests
                        {pendingSubs.length > 0 && (
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-bounce">
                                {pendingSubs.length} NEW
                            </span>
                        )}
                    </h3>
                    <Button variant="outline" size="sm" onClick={fetchPending} disabled={fetching} className="rounded-xl font-bold">
                        {fetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Refresh List
                    </Button>
                </div>

                <Card className="shadow-sm border-border/40 overflow-hidden rounded-xl">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider">User</TableHead>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider">Plan Requested</TableHead>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider">Amount</TableHead>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider">Proof</TableHead>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider">Date</TableHead>
                                <TableHead className="text-center font-bold text-[11px] uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fetching ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Fetching Requests...</p>
                                    </TableCell>
                                </TableRow>
                            ) : pendingSubs.map(sub => (
                                <TableRow key={sub.id} className="hover:bg-accent/5 transition-colors border-b last:border-0">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{sub.user?.name}</span>
                                            <span className="text-[11px] text-muted-foreground font-medium">{sub.user?.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-xs text-primary bg-primary/5 px-2 py-1 rounded-md">{sub.plan?.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-black text-xs text-foreground/80">₹{Number(sub.plan?.price).toLocaleString('en-IN')}</span>
                                    </TableCell>
                                    <TableCell>
                                        {sub.proofUrl ? (
                                            <a href={sub.proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase hover:underline">
                                                <Eye className="w-3.5 h-3.5" /> View Receipt
                                            </a>
                                        ) : (
                                            <span className="text-red-500 font-bold text-[10px] uppercase">No Proof Uploaded</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {new Date(sub.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            size="sm"
                                            className="h-8 px-5 text-[10px] uppercase font-black bg-green-600 hover:bg-green-700 text-white transition-all shadow-sm rounded-lg"
                                            onClick={() => handleApprove(sub)}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!fetching && !pendingSubs.length && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic font-medium opacity-50">
                                        <div className="flex flex-col items-center gap-3">
                                            <CheckCircle2 className="w-12 h-12 text-muted-foreground/20" />
                                            <p className="uppercase tracking-widest text-[10px] font-black">All requests cleared. Good job!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
