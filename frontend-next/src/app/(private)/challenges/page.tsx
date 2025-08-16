"use client";

import Link from "next/link";

const mockChallenges = [
  { id: 1, title: "Reverse Engineering 101", difficulty: "Easy" },
  { id: 2, title: "SQL Injection Master", difficulty: "Medium" },
  { id: 3, title: "XSS Exploit", difficulty: "Hard" },
];

export default function ChallengesPage() {
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
          Challenges
        </h1>
        <Link href="/ (auth)/challenges/add" className="btn">
          + Add Challenge
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {mockChallenges.map((challenge) => (
          <div
            className="card"
            key={challenge.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ color: "var(--accent)", fontWeight: 700 }}>
                {challenge.title}
              </h2>
              <span
                style={{ color: "var(--accent-secondary)", fontWeight: 500 }}
              >
                {challenge.difficulty}
              </span>
            </div>
            <Link
              href={`/ (auth)/challenges/edit?id=${challenge.id}`}
              className="btn"
              style={{ fontSize: 14 }}
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
