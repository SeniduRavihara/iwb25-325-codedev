"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1 className="glow" style={{ fontSize: "2rem", marginBottom: 32 }}>
        Admin Dashboard
      </h1>
      <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
        <div className="card" style={{ minWidth: 180 }}>
          <h2 style={{ color: "var(--accent)", fontWeight: 700 }}>Users</h2>
          <p style={{ fontSize: 24, color: "var(--accent-secondary)" }}>256</p>
        </div>
        <div className="card" style={{ minWidth: 180 }}>
          <h2 style={{ color: "var(--accent)", fontWeight: 700 }}>Contests</h2>
          <p style={{ fontSize: 24, color: "var(--accent-secondary)" }}>12</p>
        </div>
        <div className="card" style={{ minWidth: 180 }}>
          <h2 style={{ color: "var(--accent)", fontWeight: 700 }}>
            Challenges
          </h2>
          <p style={{ fontSize: 24, color: "var(--accent-secondary)" }}>34</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        <Link
          href="/(auth)/contests"
          className="btn"
          style={{ flex: 1, textAlign: "center" }}
        >
          Manage Contests
        </Link>
        <Link
          href="/(auth)/challenges"
          className="btn"
          style={{ flex: 1, textAlign: "center" }}
        >
          Manage Challenges
        </Link>
      </div>
    </div>
  );
}
