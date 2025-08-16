const mockChallenges = [
  { id: 1, title: "Reverse Engineering 101", difficulty: "Easy" },
  { id: 2, title: "SQL Injection Master", difficulty: "Medium" },
  { id: 3, title: "XSS Exploit", difficulty: "Hard" },
];

export default function Challenges() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {mockChallenges.map((challenge) => (
        <div className="card" key={challenge.id}>
          <h3 style={{ color: "var(--accent)", fontWeight: 700 }}>
            {challenge.title}
          </h3>
          <span style={{ color: "var(--accent-secondary)", fontWeight: 500 }}>
            {challenge.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}
