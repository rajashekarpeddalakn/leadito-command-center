import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, User as UserIcon, Phone, Building2, Loader2, Users, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import usersService from "@/service/users";
import { toast } from "sonner";

export default function LeadsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalUsers: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers(page);
  }, [page, searchQuery]);

  const fetchUsers = async (pageNum = 1) => {
    try {
      setFetching(true);
      const data = await usersService.listUsers({
        isActive: true,
        limit: 5,
        page: pageNum,
        search: searchQuery // Backend should support search in users list too
      });
      setUsers(data.users || []);
      setPagination(data.pagination || { totalPages: 1, totalUsers: 0 });
    } catch (error) {
      toast.error("Failed to load active members");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="CRM Leads" description="Select an active business account to manage campaign leads (5 per page optimization)." />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-background p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-2xl w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by business name, owner or phone..."
            className="pl-10 h-10 bg-background border-border"
          />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold gap-2">
            <Users className="w-4 h-4" /> {pagination.totalUsers} Total Accounts
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {fetching ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-medium animate-pulse text-sm">Synchronizing business directory...</p>
          </div>
        ) : users.length > 0 ? (
          <>
            {users.map(user => (
              <Card key={user.id} className="shadow-sm border-border/40 overflow-hidden transition-all hover:bg-accent/5 rounded-xl">
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted/50 rounded-lg flex items-center justify-center border shrink-0">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[14px] text-foreground leading-none">{user.businessName || "Private Business"}</h3>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[8px] uppercase tracking-tighter h-4 px-1.5">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground mt-1">
                        <div className="flex items-center gap-1"><UserIcon className="w-3 h-3 opacity-60" /> {user.name}</div>
                        <span className="opacity-30">•</span>
                        <div className="flex items-center gap-1"><Phone className="w-3 h-3 opacity-60" /> {user.phone}</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/admin/leads/${user.id}`)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-xs"
                  >
                    Manage
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pt-4 flex items-center justify-between px-1">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-2 rounded-lg">
                  Page {page} <span className="opacity-40 mx-1">of</span> {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1 || fetching}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="h-9 px-4 font-bold rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.totalPages || fetching}
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    className="h-9 px-4 font-bold rounded-lg transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center gap-4">
            <Search className="w-10 h-10 text-muted-foreground/30" />
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground">No accounts matched</p>
              <p className="text-sm text-muted-foreground/60">Try adjusting your search criteria</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setPage(1); }} className="rounded-lg mt-2 font-bold">
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
