"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BellRing, ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { loginUser } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      await loginUser({
        identifier: identifier.trim(),
        password,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.10),transparent_30%)] dark:bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.14),transparent_30%)]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-3 rounded-2xl transition hover:opacity-90"
        >
          <div className="rounded-xl bg-red-600/15 p-2">
            <BellRing className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              SEAS
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart Emergency Alert System
            </p>
          </div>
        </Link>

        <AuthCard
          title="Sign in"
          description="Access your SEAS dashboard to monitor sites, devices, and emergency events."
          footer={
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Secure access for authorized users only</span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-red-500 transition hover:text-red-400 dark:text-red-400 dark:hover:text-red-300"
                >
                  Register
                </Link>
              </p>
            </div>
          }
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <AuthInput
              label="Username or Email"
              type="text"
              name="identifier"
              placeholder="Enter your username or email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
            />

            <AuthInput
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />

            {errorMessage ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </AuthCard>
      </div>
    </main>
  );
}