"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SignupState = {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupState>({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Signup failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Create account
      </h1>

      {error && (
        <div
          role="alert"
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Full name
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
        </label>

        <label>
          Username
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
        </label>

        <label>
          Phone (optional)
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {isSubmitting ? "Creating..." : "Sign up"}
        </button>
      </form>
    </main>
  );
}
