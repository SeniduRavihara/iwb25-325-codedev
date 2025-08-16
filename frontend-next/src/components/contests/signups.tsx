const mockSignups = ["Neo", "Trinity", "Morpheus", "Switch", "Cypher"];

export default function Signups() {
  return (
    <div className="card" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2
        className="glow"
        style={{ color: "var(--accent-secondary)", fontSize: "1.5rem" }}
      >
        Signups
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 18 }}>
        {mockSignups.map((name) => (
          <li key={name} style={{ margin: "0.5rem 0", color: "var(--accent)" }}>
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
