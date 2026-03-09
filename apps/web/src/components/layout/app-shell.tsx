import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileBottomNav } from "./mobile-bottom-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.04),transparent_28%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.06),transparent_28%),linear-gradient(to_bottom,#020617,#020617)] dark:text-slate-100">
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}