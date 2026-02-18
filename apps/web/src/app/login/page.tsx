"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); // username or email later
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Login
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
          Username or Email
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
