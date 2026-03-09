import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { ShieldCheck, UserCircle2 } from "lucide-react";

export default async function ProfilePage() {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { user_id: authUser.user_id },
    select: {
      full_name: true,
      username: true,
      email: true,
      phone: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Profile
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Manage your account information and password.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <UserCircle2 className="h-4 w-4" />
            <span className="font-medium text-slate-900 dark:text-white">
              @{user.username}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Account active
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Account Information
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update your personal account details and contact information.
            </p>
          </div>

          <ProfileForm
            initialValues={{
              full_name: user.full_name,
              username: user.username,
              email: user.email,
              phone: user.phone ?? "",
            }}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Security
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Change your password to keep your SEAS account secure.
            </p>
          </div>

          <PasswordForm />
        </div>
      </section>
    </div>
  );
}