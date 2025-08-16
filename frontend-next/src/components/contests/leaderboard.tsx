const mockLeaderboard = [
  { rank: 1, name: "Neo", score: 980 },
  { rank: 2, name: "Trinity", score: 920 },
  { rank: 3, name: "Morpheus", score: 870 },
];

export default function Leaderboard() {
  return (
    <div className="card" style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2
        className="glow"
        style={{ color: "var(--accent-secondary)", fontSize: "1.5rem" }}
      >
        Leaderboard
      </h2>
      <table
        style={{ width: "100%", color: "var(--foreground)", marginTop: 16 }}
      >
        <thead>
          <tr style={{ color: "var(--accent)", fontWeight: 700 }}>
            <th style={{ textAlign: "left" }}>Rank</th>
            <th style={{ textAlign: "left" }}>Name</th>
            <th style={{ textAlign: "left" }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {mockLeaderboard.map((entry) => (
            <tr key={entry.rank}>
              <td>{entry.rank}</td>
              <td>{entry.name}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
