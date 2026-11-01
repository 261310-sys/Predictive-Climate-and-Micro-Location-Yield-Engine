import { Link, useRouterState } from "@tanstack/react-router";
import { Bot, FileText, LayoutDashboard, Map, Satellite, TrendingUp, FlaskConical } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo, LogoMark } from "@/components/brand/Logo";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/location", label: "Location Intelligence", icon: Map },
  { to: "/soil", label: "Soil & Satellite", icon: Satellite },
  { to: "/predictions", label: "Climate Prediction", icon: TrendingUp },
  { to: "/assistant", label: "Farming Assistant", icon: Bot },
  { to: "/report", label: "Risk Report", icon: FileText },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center" onClick={() => setOpenMobile(false)}>
          {collapsed ? <LogoMark /> : <Logo tone="light" />}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = pathname === item.to;
                return (
                  <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.label}
                    className="h-10 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-semibold"
                  >
                    <Link to={item.to} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {!collapsed ? (
              <div className="rounded-xl border border-sidebar-border bg-sidebar-accent p-3 text-xs text-sidebar-foreground">
                <div className="mb-1 flex items-center gap-1.5 font-semibold text-sidebar-primary">
                  <FlaskConical className="h-3.5 w-3.5" /> Demo mode
                </div>
                All readings are simulated. Ready for IMD, ISRO Bhuvan & Copernicus integration.
              </div>
            ) : (
              <div className="flex justify-center text-sidebar-primary" title="Demo mode — simulated data">
                <FlaskConical className="h-4 w-4" />
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
