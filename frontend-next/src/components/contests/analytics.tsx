export default function Analytics() {
  return (
    <div className="card" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2
        className="glow"
        style={{ color: "var(--accent-secondary)", fontSize: "1.5rem" }}
      >
        Contest Analytics
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 18 }}>
        <li style={{ margin: "1rem 0" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>
            Participants:
          </span>{" "}
          128
        </li>
        <li style={{ margin: "1rem 0" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>
            Average Score:
          </span>{" "}
          74.2
        </li>
        <li style={{ margin: "1rem 0" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>
            Most Solved Challenge:
          </span>{" "}
          SQL Injection Master
        </li>
      </ul>
    </div>
  );
}
