import {
  LayoutDashboard, Link2, Search, List, Brain, FlaskConical, Calendar,
  BookOpen, Target, ClipboardList, Briefcase, FileCheck, BarChart3,
  Cpu, Server, Settings, TrendingUp,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navGroups = [
  {
    label: "Core",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Chain Explorer", url: "/symbol/SPY", icon: Link2 },
      { title: "Scanner", url: "/scanner", icon: Search },
      { title: "Watchlists", url: "/watchlist", icon: List },
    ],
  },
  {
    label: "Analysis",
    items: [
      { title: "AI Workspace", url: "/analyze", icon: Brain },
      { title: "Strategy Lab", url: "/lab", icon: FlaskConical },
      { title: "Events", url: "/events", icon: Calendar },
      { title: "Research", url: "/research", icon: BookOpen },
      { title: "Forecasts", url: "/forecasts", icon: Target },
    ],
  },
  {
    label: "Trading",
    items: [
      { title: "Journal", url: "/journal", icon: ClipboardList },
      { title: "Portfolio", url: "/portfolio", icon: Briefcase },
      { title: "Reviews", url: "/review", icon: FileCheck },
      { title: "Backtest", url: "/backtest", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { title: "RL Research", url: "/research/rl", icon: Cpu },
      { title: "Providers", url: "/providers", icon: Server },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="py-4">
        {!collapsed && (
          <div className="mb-4 px-4">
            <p className="micro-label mb-1">Advisory-Only Options Workstation</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-heading text-lg font-bold text-foreground">OptiFlow</span>
              <span className="rounded-pill bg-[hsl(263_70%_58%)] px-2 py-0.5 text-[9px] font-mono font-bold text-white">V3</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mb-4 flex flex-col items-center gap-1 px-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="rounded-pill bg-[hsl(263_70%_58%)] px-1.5 py-0.5 text-[7px] font-mono font-bold text-white">V3</span>
          </div>
        )}

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="micro-label px-4 py-2">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={isActive(item.url) ? "nav-active" : "nav-inactive"}
                        activeClassName="nav-active"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="ml-2 text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
