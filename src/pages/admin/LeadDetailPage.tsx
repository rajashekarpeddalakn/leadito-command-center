import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    Search, Loader2, User as UserIcon, Phone, Building2,
    Calendar, Eye, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, RotateCcw
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import leadService from "@/service/lead";
import usersService from "@/service/users";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

type LeadStatus = "new" | "not_answered" | "interested" | "not_interested" | "follow_up" | "appointment_booked" | "closed";
const STATUSES: LeadStatus[] = ["new", "not_answered", "interested", "not_interested", "follow_up", "appointment_booked", "closed"];

const statusColor: Record<string, string> = {
    new: "bg-blue-50 text-blue-600 border-blue-100",
    not_answered: "bg-slate-50 text-slate-500 border-slate-100",
    interested: "bg-emerald-50 text-emerald-600 border-emerald-100",
    not_interested: "bg-red-50 text-red-600 border-red-100",
    follow_up: "bg-purple-50 text-purple-600 border-purple-100",
    appointment_booked: "bg-primary/5 text-primary border-primary/10",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
};

const niceStatus = (s: string) => s ? s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Unknown";

export default function LeadDetailPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [leads, setLeads] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>({ total: 0, statusWise: {} });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, totalLeads: 0 });
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });

    // History / Chat features
    const [historyNotes, setHistoryNotes] = useState<any[]>([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    useEffect(() => {
        fetchLeads(page);
    }, [userId, page, activeFilter, searchQuery, dateRange]);

    const fetchUserDetails = async () => {
        try {
            const data = await usersService.listUsers({ id: userId });
            if (data.users && data.users.length > 0) {
                setUser(data.users[0]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLeads = async (pageNum = 1) => {
        try {
            setFetching(true);
            const data = await leadService.listLeads({
                userId,
                page: pageNum,
                limit: 5,
                search: searchQuery,
                filter: activeFilter,
                startDate: activeFilter === 'Custom' ? dateRange?.from?.toISOString() : undefined,
                endDate: activeFilter === 'Custom' ? dateRange?.to?.toISOString() : undefined
            });
            setLeads(data.leads || []);
            setMetrics(data.metrics || { total: 0, statusWise: {} });
            setPagination(data.pagination || { totalPages: 1, totalLeads: 0 });
        } catch (error) {
            toast.error("Failed to fetch leads");
        } finally {
            setFetching(false);
        }
    };

    // History Fetching Logic
    const fetchHistory = useCallback(async (leadId: string, pageNum: number, reset = false) => {
        if (historyLoading || (!hasMoreHistory && !reset)) return;

        try {
            setHistoryLoading(true);
            const data = await leadService.getLeadNotes(leadId, { page: pageNum, limit: 10 });
            const newNotes = data.notes || [];

            setHistoryNotes(prev => reset ? newNotes : [...prev, ...newNotes]);
            setHasMoreHistory(pageNum < (data.pagination?.totalPages || 1));
            setHistoryPage(pageNum);
        } catch (error) {
            toast.error("Failed to load history");
        } finally {
            setHistoryLoading(false);
        }
    }, [historyLoading, hasMoreHistory]);

    // Open modal and load first page of history
    const handleOpenLead = (lead: any) => {
        setSelectedLead(lead);
        setHistoryNotes([]);
        setHistoryPage(1);
        setHasMoreHistory(true);
        fetchHistory(lead.id, 1, true);
    };

    // Scroll handler for infinite scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
            if (!historyLoading && hasMoreHistory && selectedLead) {
                fetchHistory(selectedLead.id, historyPage + 1);
            }
        }
    };

    const counts = metrics.statusWise || {};

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/admin/leads")}
                    className="rounded-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{user?.businessName || "Business Leads"}</h1>
                    <p className="text-muted-foreground font-medium text-sm">Managing leads for {user?.name}</p>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                <Card className="shadow-sm border-primary/20 bg-primary/5">
                    <CardContent className="p-2.5">
                        <p className="text-[9px] text-primary uppercase font-black tracking-wider mb-0.5">Total Leads</p>
                        <p className="text-lg font-bold tracking-tight">{metrics.total}</p>
                    </CardContent>
                </Card>
                {STATUSES.map(s => (
                    <Card key={s} className="shadow-sm border-border/40">
                        <CardContent className="p-2.5">
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mb-0.5">{niceStatus(s)}</p>
                            <p className="text-lg font-bold tracking-tight text-foreground">{counts[s] || 0}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters and Search */}
            <Card className="p-4 shadow-sm border-border/40 rounded-xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1 bg-muted/30 p-1 rounded-lg w-full lg:w-auto">
                        {['All', 'Daily', 'Weekly', 'Monthly', 'Custom'].map((f) => (
                            <Button
                                key={f}
                                variant={activeFilter === f ? "default" : "ghost"}
                                size="sm"
                                onClick={() => { setActiveFilter(f); setPage(1); }}
                                className={`flex-1 lg:flex-none rounded-md text-[11px] font-bold uppercase h-8 px-4 ${activeFilter === f ? 'shadow-sm shadow-primary/20' : 'text-muted-foreground'
                                    }`}
                            >
                                {f}
                            </Button>
                        ))}
                    </div>

                    {activeFilter === 'Custom' && (
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10 px-4 rounded-xl border-border/60 bg-background font-bold text-xs flex items-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4 text-primary" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a Date Range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-border/40 overflow-hidden" align="center" sideOffset={8}>
                                    <CalendarComponent
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            setDateRange(range);
                                            if (range?.from && range?.to) {
                                                setPage(1);
                                            }
                                        }}
                                    />
                                    <div className="p-3 bg-muted/30 border-t flex items-center justify-between gap-4">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                            Custom Range
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setDateRange(undefined);
                                                setActiveFilter('All');
                                                setPage(1);
                                            }}
                                            className="h-7 px-2 text-[10px] font-bold uppercase text-destructive hover:bg-destructive/10"
                                        >
                                            <RotateCcw className="w-3 h-3 mr-1" /> Reset Filter
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <div className="relative flex-1 w-full max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search by name or phone..."
                            className="pl-10 h-10 bg-background border-border"
                        />
                    </div>
                </div>
            </Card>

            {/* Leads Table */}
            <Card className="rounded-xl border-border/40 overflow-hidden shadow-sm">
                {fetching ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                        <p className="font-bold text-muted-foreground text-sm uppercase tracking-wider animate-pulse">Loading leads...</p>
                    </div>
                ) : leads.length > 0 ? (
                    <>
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6 font-bold uppercase text-[10px] tracking-wider">Lead Identity</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider">Phone</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider">Status</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider">Source</TableHead>
                                    <TableHead className="text-right pr-6 font-bold uppercase text-[10px] tracking-wider">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map(lead => (
                                    <TableRow key={lead.id} className="hover:bg-accent/5 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-sm text-foreground">{lead.name}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(lead.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[13px] font-medium text-foreground">{lead.phone || "—"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${statusColor[lead.status] || ""} font-bold text-[9px] uppercase tracking-wider px-2 py-0`}>
                                                {niceStatus(lead.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{lead.source}</span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => handleOpenLead(lead)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-background px-4 py-2 rounded-lg border">
                                    P.{page} <span className="mx-2 opacity-30">/</span> {pagination.totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1 || fetching}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="h-9 px-4 font-bold rounded-lg border-primary/20 hover:bg-primary hover:text-white"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1.5" /> Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === pagination.totalPages || fetching}
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        className="h-9 px-4 font-bold rounded-lg border-primary/20 hover:bg-primary hover:text-white"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-24 text-center flex flex-col items-center gap-4">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/20" />
                        <div className="space-y-1">
                            <p className="font-bold text-muted-foreground">No leads found</p>
                            <p className="text-xs text-muted-foreground/60 font-medium italic">Try changing filters or range</p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Lead Dialog with History Chat */}
            <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <DialogContent className="max-w-[480px] p-0 overflow-hidden rounded-xl border-border/40 shadow-xl">
                    {selectedLead && (
                        <>
                            <DialogHeader className="bg-muted/30 p-6 border-b">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <DialogTitle className="text-xl font-bold tracking-tight">{selectedLead.name}</DialogTitle>
                                        <DialogDescription className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                            Captured on {new Date(selectedLead.createdAt).toLocaleDateString()} via {selectedLead.source}
                                        </DialogDescription>
                                    </div>
                                    <Badge variant="outline" className={`${statusColor[selectedLead.status]} text-[10px] font-bold px-3 py-1 uppercase`}>
                                        {niceStatus(selectedLead.status)}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar" onScroll={handleScroll}>
                                <div className="p-4 rounded-lg bg-muted/50 border border-border/60">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Mobile Contact</p>
                                    <p className="text-base font-bold text-foreground flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" /> {selectedLead.phone || "—"}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="font-bold text-foreground text-xs flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                                        <MessageSquare className="w-4 h-4 text-primary" /> Activity History Chat
                                    </h5>

                                    <div className="space-y-3">
                                        {historyNotes.length > 0 ? (
                                            <>
                                                {historyNotes.map((n: any) => (
                                                    <div key={n.id} className="p-3 rounded-lg border bg-background hover:bg-accent/5 transition-all">
                                                        <p className="text-[13px] font-medium text-foreground/80 leading-relaxed italic">&quot;{n.note}&quot;</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-2 flex justify-between">
                                                            <span>Log Entry</span>
                                                            <span>{new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </p>
                                                    </div>
                                                ))}
                                                {historyLoading && (
                                                    <div className="flex justify-center p-4">
                                                        <Loader2 className="w-6 h-6 animate-spin text-primary/20" />
                                                    </div>
                                                )}
                                                {!hasMoreHistory && historyNotes.length > 0 && (
                                                    <p className="text-center text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em] py-4">End of History</p>
                                                )}
                                            </>
                                        ) : historyLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Syncing activity logs...</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-muted/10 rounded-lg border border-dashed">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">No activity history recorded</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-muted/20 border-t flex justify-end">
                                <Button onClick={() => setSelectedLead(null)} className="rounded-lg font-bold">
                                    Close Details
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
