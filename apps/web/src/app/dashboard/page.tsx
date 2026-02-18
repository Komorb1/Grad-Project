"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
      <p>You are authenticated.</p>

      <button
        onClick={logout}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ccc",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Logging out..." : "Logout"}
      </button>
    </main>
  );
}
