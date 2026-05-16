"use client";

import { Suspense, useState } from "react";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";

function SidebarFallback() {
  return <div className="hidden md:block w-[248px] shrink-0" />;
}

export function RecruiterShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F6F7F9]">
      <Suspense fallback={<SidebarFallback />}>
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
      </Suspense>

      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-[rgba(15,15,15,0.10)] flex items-center px-4 gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-[#F6F7F9]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[248px] border-0">
            <Suspense fallback={null}>
              <DashboardSidebar onNavigate={() => setOpen(false)} />
            </Suspense>
          </SheetContent>
        </Sheet>
        <Logo size="sm" />
        <span className="font-display font-bold text-sm">HireDoc AI</span>
      </div>

      <main className="flex-1 md:ml-[248px] min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
