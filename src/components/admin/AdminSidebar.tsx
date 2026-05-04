import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Video, MessageSquareQuote, Sparkles, BarChart3, Users, CreditCard, ContactRound } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import logo from "@/assets/leadito-logo.png";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Videos", url: "/admin/videos", icon: Video },
  { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquareQuote },
  { title: "Services", url: "/admin/services", icon: Sparkles },
  { title: "Plans & Pricing", url: "/admin/plans", icon: CreditCard },
  { title: "Ad Results", url: "/admin/ads", icon: BarChart3 },
  { title: "CRM Leads", url: "/admin/leads", icon: ContactRound },
  { title: "Users", url: "/admin/users", icon: Users },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src={logo} alt="Leadito AI" className="w-9 h-9 rounded-lg shrink-0" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sidebar-foreground">Leadito AI</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.end ? pathname === item.url : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end={item.end} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
