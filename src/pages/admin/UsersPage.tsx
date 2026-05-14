import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Shield, ShieldOff, Search, Loader2, Power, PowerOff, Building2, User as UserIcon, Users, Calendar, MapPin, Briefcase, Zap, Star, CheckCircle2, AlertCircle, Trash2, ChevronLeft, ChevronRight, Eye, X, MessageSquare, Clock, Phone, MousePointer2 } from "lucide-react";
import usersService from "@/service/users";
import plansService from "@/service/plans";
import { confirmAction } from "@/lib/alerts";

const LEAD_STATUS_OPTIONS = [
  "New Lead", "Call Not Answered", "Interested", "Not Interested", "Follow-Up", "Appointment Booked", "Payment Pending", "Closed"
];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [activatingUser, setActivatingUser] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [freePage, setFreePage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalUsers: 0 });
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("active");

  const currentPage = activeTab === "active" ? activePage : freePage;

  useEffect(() => {
    setActivePage(1);
    setFreePage(1);
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(currentPage);
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, activeTab, searchQuery]);

  const fetchData = async (pageNum = 1) => {
    try {
      setFetching(true);
      const [usersData, plansData] = await Promise.all([
        usersService.listUsers({
          page: pageNum,
          limit: 5,
          isActive: activeTab === "active",
          search: searchQuery
        }),
        plansService.listPlans()
      ]);
      setUsers(usersData.users || []);
      setPagination(usersData.pagination || { totalPages: 1, totalUsers: 0 });
      setPlans(plansData);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setFetching(false);
    }
  };

  const filteredUsers = users || []; // Server side filtering now handles this

  const paidUsers = useMemo(() => (filteredUsers || []).filter((u: any) => u.isActive), [filteredUsers]);
  const freeUsers = useMemo(() => (filteredUsers || []).filter((u: any) => !u.isActive), [filteredUsers]);

  const handleActivate = async () => {
    if (!selectedPlanId) return toast.error("Please select a plan for activation");
    try {
      setActionLoading(true);
      await usersService.activateUser(activatingUser.id, selectedPlanId);
      toast.success(`${activatingUser.name} activated successfully`);
      setActivatingUser(null);
      setSelectedPlanId("");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Activation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const isSuspending = user.isActive;
    const confirmed = await confirmAction({
      title: isSuspending ? "Suspend Access" : "Restore Access",
      text: isSuspending
        ? `Are you sure you want to suspend access for ${user.name}? Their data will remain safe, but they will lose premium features until reactivated.`
        : `Ready to restore premium access for ${user.name}? This will immediately enable their features.`,
      confirmButtonText: isSuspending ? "Yes, Suspend" : "Yes, Restore",
      isDestructive: isSuspending
    });

    if (!confirmed) return;
    try {
      await usersService.toggleStatus(user.id);
      toast.success(isSuspending ? "Account Suspended" : "Account Reactivated");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  const handleUpdateLeadInfo = async (userId: string, data: any) => {
    try {
      await usersService.updateLeadInfo(userId, data);
      toast.success("Lead information updated");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const UserTable = ({ data, title }: { data: any[], title: string }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
          {title === "Premium Members" ? <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> : <Users className="w-5 h-5 text-primary" />}
          {title} <span className="text-muted-foreground ml-1 font-normal text-sm">({pagination.totalUsers} total members)</span>
        </h3>
      </div>
      <Card className="shadow-sm border-border/40 overflow-hidden rounded-xl">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider">Account</TableHead>
              {title === "Premium Members" ? (
                <>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Active Plan</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Start Date</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Expiry Date</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Renewal Status</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Account Status</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Signup & Last Seen</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Lead Status</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Follow-up</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider">Notes</TableHead>
                </>
              )}
              <TableHead className="text-center font-bold text-[11px] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(u => (
              <TableRow key={u.id} className="hover:bg-accent/5 transition-colors border-b last:border-0">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm flex items-center gap-2 text-foreground/90">{u.name}</span>
                    <span className="text-[11px] text-muted-foreground font-medium">{u.phone}</span>
                  </div>
                </TableCell>

                {title === "Premium Members" ? (
                  <>
                    <TableCell>
                      <span className="font-bold text-[13px] text-primary">{u.subscriptions?.[0]?.plan?.name || "Trial Partner"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-xs">
                        {u.subscriptions?.[0]?.startDate ? new Date(u.subscriptions[0].startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-xs">
                        {u.subscriptions?.[0]?.expiryDate ? new Date(u.subscriptions[0].expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-black uppercase tracking-widest px-2">Manual</Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const expiry = u.subscriptions?.[0]?.expiryDate;
                        const isExpired = expiry && new Date(expiry) < new Date();
                        const status = !u.isActive ? "Disabled" : (isExpired ? "Expired" : "Active");
                        const color = status === "Active" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : (status === "Expired" ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-500 bg-slate-50 border-slate-100");

                        return (
                          <Badge className={`${color} border font-black text-[9px] uppercase tracking-widest px-2 shadow-none`}>
                            {status}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="text-[11px] font-medium whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-primary/60">
                          <MousePointer2 className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {u.lastActivity ? `Last Seen: ${new Date(u.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "New Lead"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={u.leadStatus || "New Lead"} onValueChange={(val) => handleUpdateLeadInfo(u.id, { leadStatus: val })}>
                        <SelectTrigger className="h-8 text-[11px] font-bold w-[140px] bg-background border-primary/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt} className="text-xs font-semibold">{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Input
                          type="date"
                          defaultValue={u.nextFollowUpDate || ""}
                          className="h-8 text-[10px] font-bold w-[110px] p-1 pr-0"
                          onBlur={(e) => {
                            if (e.target.value !== (u.nextFollowUpDate || "")) {
                              handleUpdateLeadInfo(u.id, { nextFollowUpDate: e.target.value });
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/5">
                            <MessageSquare className="w-3.5 h-3.5 mr-1" />
                            <span className="text-[10px] font-bold">{u.adminNotes ? "View Notes" : "Add Note"}</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-primary" /> Admin Notes
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium">Update internal tracking notes for {u.name}.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <textarea
                              className="w-full min-h-[150px] p-3 rounded-xl border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                              defaultValue={u.adminNotes || ""}
                              placeholder="Type your notes here..."
                              onBlur={(e) => {
                                if (e.target.value !== (u.adminNotes || "")) {
                                  handleUpdateLeadInfo(u.id, { adminNotes: e.target.value });
                                }
                              }}
                            />
                          </div>
                          <DialogFooter>
                            <DialogTrigger asChild>
                              <Button className="w-full rounded-xl font-bold text-xs uppercase">Done</Button>
                            </DialogTrigger>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </>
                )}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {u.isActive ? (
                      <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-bold text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => handleToggleStatus(u)}>
                        <PowerOff className="w-3.5 h-3.5 mr-1.5" /> Suspend
                      </Button>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-8 px-4 text-xs font-bold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => setActivatingUser(u)}>
                          <Shield className="w-3.5 h-3.5 mr-1.5" /> {u.subscriptions?.length > 0 ? "Renew Plan" : "Activate"}
                        </Button>
                        {u.subscriptions?.length > 0 && (
                          <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => handleToggleStatus(u)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Quick Reactivate
                          </Button>
                        )}
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground/40 hover:text-primary hover:bg-primary/5"
                      onClick={() => setViewingUser(u)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!data.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic font-medium opacity-50">
                  No accounts found in this directory.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  return (
    <div className="animate-fade-in pb-10 max-w-[1400px] mx-auto">
      <PageHeader title="Members Directory" description="Manage user subscriptions, onboarding status, and platform access." />

      <div className="mb-8 sticky top-0 z-30 bg-background/95 backdrop-blur-sm pb-4 pt-1">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, business, city or phone..."
            className="pl-9 h-11 bg-card border-border/60 focus:ring-primary/20 shadow-sm rounded-xl"
          />
        </div>
      </div>

      {fetching ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Fetching directory...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50 p-1 h-10 rounded-lg">
              <TabsTrigger value="active" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-xs px-6">
                Active Members
              </TabsTrigger>
              <TabsTrigger value="free" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-xs px-6">
                New Leads / Free Users
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="animate-in fade-in duration-300">
            <UserTable data={paidUsers} title="Premium Members" />
          </TabsContent>

          <TabsContent value="free" className="animate-in fade-in duration-300">
            <UserTable data={freeUsers} title="Lead Directory" />
          </TabsContent>
        </Tabs>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-card border border-border/40 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Page</span>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-black text-xs">
              {currentPage} <span className="text-primary/40 mx-1">/</span> {pagination.totalPages}
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Total {pagination.totalUsers} Members</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || fetching}
              onClick={() => {
                if (activeTab === "active") setActivePage(p => Math.max(1, p - 1));
                else setFreePage(p => Math.max(1, p - 1));
              }}
              className="rounded-xl border-border/60 font-bold h-9 px-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pagination.totalPages || fetching}
              onClick={() => {
                if (activeTab === "active") setActivePage(p => Math.min(pagination.totalPages, p + 1));
                else setFreePage(p => Math.min(pagination.totalPages, p + 1));
              }}
              className="rounded-xl border-border/60 font-bold h-9 px-4"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!viewingUser} onOpenChange={(o) => { if (!o) setViewingUser(null); }}>
        <DialogContent className="max-w-xl rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-white">
          {viewingUser && (
            <div className="flex flex-col">
              <div className="bg-gradient-to-br from-primary/10 via-primary/[0.02] to-transparent p-5 flex items-center gap-4 border-b border-primary/5">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-xl font-black text-primary border-2 border-white shrink-0 overflow-hidden">
                  {viewingUser.logoUrl ? (
                    <img src={viewingUser.logoUrl} alt={viewingUser.name} className="w-full h-full object-cover" />
                  ) : (
                    viewingUser.name?.[0] || viewingUser.phone?.[0]
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight leading-none">{viewingUser.name || "Member Profile"}</h2>
                    {viewingUser.isActive && <Badge className="bg-emerald-500 text-white border-0 font-black text-[9px] px-1.5 h-4 tracking-widest">VERIFIED</Badge>}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1 opacity-70">{viewingUser.phone}</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.15em] ml-1">Entity Intelligence</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 bg-muted/30 rounded-xl border border-border/40 flex items-center gap-3">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm text-primary shrink-0"><Building2 className="w-3.5 h-3.5" /></div>
                        <div className="overflow-hidden">
                          <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-tighter mb-0.5">Business Name</p>
                          <p className="text-[13px] font-black truncate leading-tight">{viewingUser.businessName || "Independent"}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-xl border border-border/40 flex items-center gap-3">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm text-primary shrink-0"><MapPin className="w-3.5 h-3.5" /></div>
                        <div className="overflow-hidden">
                          <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-tighter mb-0.5">Primary Location</p>
                          <p className="text-[13px] font-black truncate leading-tight">{viewingUser.city || "Not Specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.15em] ml-1">Contract Status</p>
                  <div className={`p-4 rounded-[1.5rem] border transition-all ${viewingUser.isActive ? 'bg-emerald-500/[0.03] border-emerald-500/10 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-2 h-2 rounded-full ${viewingUser.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${viewingUser.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {viewingUser.isActive ? 'Active Subscription' : 'No Active Plan'}
                      </span>
                    </div>

                    {viewingUser.isActive ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-[8px] font-bold text-emerald-600/40 uppercase tracking-widest mb-1">Current Strategy</p>
                          <p className="font-black text-base tracking-tight text-emerald-950 flex items-center gap-1.5 leading-none">
                            {viewingUser.subscriptions?.[0]?.plan?.name || "Premium Membership"}
                            <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                          </p>
                        </div>
                        <div className="flex justify-between items-end pt-4 border-t border-emerald-500/5">
                          <div>
                            <p className="text-[8px] font-bold text-emerald-600/40 uppercase tracking-widest mb-1">Closing Date</p>
                            <div className="flex items-center gap-1.5 text-emerald-900/80">
                              <Calendar className="w-3 h-3 opacity-40" />
                              <span className="text-[12px] font-black tracking-tight">{viewingUser.subscriptions?.[0]?.expiryDate ? new Date(viewingUser.subscriptions[0].expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Rolling"}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-bold text-emerald-600/40 uppercase tracking-widest mb-1">Price Point</p>
                            <p className="font-black text-base text-emerald-950 leading-none">₹{viewingUser.subscriptions?.[0]?.plan?.price || "—"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center py-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Access Restricted<br />Free Tier Account</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/10 border-t flex justify-center">
                <Button onClick={() => setViewingUser(null)} className="font-black text-[10px] uppercase tracking-[0.2em] text-primary w-full h-10 bg-white border-2 border-primary/10 hover:border-primary/40 rounded-xl transition-all shadow-sm">
                  Close Personnel File
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activation Dialog */}
      <Dialog open={!!activatingUser} onOpenChange={(o) => { if (!o) setActivatingUser(null); }}>
        <DialogContent className="max-w-md rounded-2xl overflow-hidden shadow-2xl transition-all">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Shield className="w-5 h-5 text-primary" /> Activate Membership
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground">
              Assign a subscription plan to enable premium platform features.
            </DialogDescription>
          </DialogHeader>
          {activatingUser && (
            <div className="space-y-5 py-2">
              <div className="bg-muted/50 p-4 rounded-xl border border-border/40">
                <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Activating Account:</p>
                <div className="flex flex-col">
                  <span className="font-bold text-base leading-tight">{activatingUser.name}</span>
                  <span className="text-sm font-medium text-primary">{activatingUser.businessName || "Member Account"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground ml-1">Subscription Plan</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger className="h-12 border rounded-xl font-semibold bg-background transition-all hover:border-primary/40">
                    <SelectValue placeholder="Choose a plan..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {plans.map(p => (
                      <SelectItem key={p.id} value={String(p.id)} className="py-2.5 font-semibold">
                        <div className="flex justify-between items-center w-full min-w-[200px]">
                          <span>{p.name}</span>
                          <span className="text-primary font-bold">₹{p.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setActivatingUser(null)} disabled={actionLoading} className="font-bold text-xs uppercase h-10 px-6">Cancel</Button>
            <Button onClick={handleActivate} disabled={actionLoading || !selectedPlanId} className="h-10 bg-primary text-white hover:bg-primary/90 px-8 rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20">
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Activate Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
