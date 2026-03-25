import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PushNotificationButton } from "@/components/push-notification-button";

export async function Topbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
            <span className="sm:hidden">SEAS</span>
            <span className="hidden sm:inline">Smart Emergency Alert System</span>
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor sites, devices, and emergency events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
          <PushNotificationButton />
          <ThemeToggle />

          <Link
            href="/profile"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {user ? `@${user.username}` : "User"}
          </Link>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}