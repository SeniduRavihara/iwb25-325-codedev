"use client";

import Link from "next/link";

const mockContests = [
  { id: 1, title: "Cyber Battle Royale", date: "2024-07-01" },
  { id: 2, title: "Hack the Planet", date: "2024-08-15" },
  { id: 3, title: "Ballerina CTF", date: "2024-09-10" },
];

export default function ContestsPage() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 className="glow" style={{ fontSize: "2rem" }}>
          Contests
        </h1>
        <Link href="/ (auth)/contests/create" className="btn">
          + Create Contest
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {mockContests.map((contest) => (
          <div
            className="card"
            key={contest.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ color: "var(--accent)", fontWeight: 700 }}>
                {contest.title}
              </h2>
              <span
                style={{ color: "var(--accent-secondary)", fontWeight: 500 }}
              >
                Date: {contest.date}
              </span>
            </div>
            <Link
              href={`/ (auth)/contests/${contest.id}`}
              className="btn"
              style={{ fontSize: 14 }}
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
