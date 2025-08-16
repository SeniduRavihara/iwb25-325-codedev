export default function ContestDetails() {
  return (
    <div className="card" style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2
        className="glow"
        style={{ color: "var(--accent-secondary)", fontSize: "1.5rem" }}
      >
        Contest Details
      </h2>
      <div style={{ margin: "1rem 0" }}>
        <strong style={{ color: "var(--accent)" }}>Title:</strong> Cyber Battle
        Royale
      </div>
      <div style={{ margin: "1rem 0" }}>
        <strong style={{ color: "var(--accent)" }}>Date:</strong> 2024-07-01
      </div>
      <div style={{ margin: "1rem 0" }}>
        <strong style={{ color: "var(--accent)" }}>Description:</strong> The
        ultimate cyberpunk coding contest. Hack your way to the top!
      </div>
    </div>
  );
}
