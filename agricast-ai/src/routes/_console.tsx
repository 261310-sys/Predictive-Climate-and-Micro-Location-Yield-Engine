import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { LocationCropBar } from "@/components/app/LocationCropBar";
import { SimulatedBadge } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_console")({
  component: ConsoleLayout,
});

function ConsoleLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
          <div className="flex flex-col gap-2 px-4 py-3 md:px-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-foreground" />
              <SimulatedBadge />
            </div>
            <LocationCropBar />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
