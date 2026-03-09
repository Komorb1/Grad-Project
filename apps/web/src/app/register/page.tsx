"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { BellRing, ShieldCheck, UserPlus } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { signupUser } from "@/lib/api/auth";

type FormState = {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const initialFormState: FormState = {
  full_name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMismatch = useMemo(() => {
    if (!form.confirmPassword) return false;
    return form.password !== form.confirmPassword;
  }, [form.password, form.confirmPassword]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (
      !form.full_name.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (passwordMismatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);

      await signupUser({
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });

      router.push("/login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create account. Please try again."
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
          title="Create account"
          description="Register to start managing monitored sites, connected devices, and alerts."
          footer={
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Secure registration for authorized users</span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-red-500 transition hover:text-red-400 dark:text-red-400 dark:hover:text-red-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          }
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <AuthInput
              label="Full Name"
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={(event) => updateField("full_name", event.target.value)}
              autoComplete="name"
            />

            <AuthInput
              label="Username"
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              autoComplete="username"
            />

            <AuthInput
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
            />

            <AuthInput
              label="Phone (optional)"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              autoComplete="tel"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <AuthInput
                label="Password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                autoComplete="new-password"
              />

              <AuthInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                autoComplete="new-password"
                error={passwordMismatch ? "Passwords do not match." : undefined}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
              <span>
                Use a strong password with at least 8 characters for better
                account security.
              </span>
            </div>

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
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </AuthCard>
      </div>
    </main>
  );
}