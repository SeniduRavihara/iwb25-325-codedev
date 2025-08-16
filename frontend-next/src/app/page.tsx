"use client";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2.5rem",
      }}
    >
      <section style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1
          className="glow"
          style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "1rem" }}
        >
          Welcome to{" "}
          <span style={{ color: "var(--accent-secondary)" }}>Hackathon+</span>{" "}
          Ballerina
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--accent)",
            marginBottom: "2rem",
          }}
        >
          The ultimate cyberpunk coding contest platform.
          <br />
          <span style={{ color: "var(--accent-secondary)" }}>
            Compete. Hack. Win.
          </span>
        </p>
        <a
          href="/(auth)/contests"
          className="btn"
          style={{ fontSize: "1.2rem" }}
        >
          View Contests
        </a>
      </section>
      <section
        style={{
          width: "100%",
          maxWidth: 900,
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "center",
        }}
      >
        <div className="card" style={{ minWidth: 260, flex: 1 }}>
          <h2
            className="glow"
            style={{ color: "var(--accent-secondary)", fontSize: "1.5rem" }}
          >
            Live Leaderboards
          </h2>
          <p>Track your rank in real-time as you hack your way to the top.</p>
        </div>
        <div className="card" style={{ minWidth: 260, flex: 1 }}>
          <h2
            className="glow"
            style={{ color: "var(--accent-secondary)", fontSize: "1.5rem" }}
          >
            Challenging Problems
          </h2>
          <p>Face off against the best with a variety of coding challenges.</p>
        </div>
        <div className="card" style={{ minWidth: 260, flex: 1 }}>
          <h2
            className="glow"
            style={{ color: "var(--accent-secondary)", fontSize: "1.5rem" }}
          >
            Analytics
          </h2>
          <p>Analyze your performance and improve your hacking skills.</p>
        </div>
      </section>
      <section style={{ marginTop: "2rem", textAlign: "center" }}>
        <h3
          style={{
            color: "var(--accent)",
            fontWeight: 700,
            fontSize: "1.3rem",
          }}
        >
          Ready to join the next contest?
        </h3>
        <a
          href="/(auth)/contests/create"
          className="btn"
          style={{ marginTop: "1rem" }}
        >
          Create a Contest
        </a>
      </section>
    </div>
  );
}
