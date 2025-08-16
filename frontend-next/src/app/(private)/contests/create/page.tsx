"use client";

import React, { useState } from "react";

export default function CreateContestPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Contest created! (mock)");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 500,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <h1 className="glow" style={{ fontSize: "2rem" }}>
        Create Contest
      </h1>
      <input
        className="card"
        style={{ padding: 12, fontSize: 16 }}
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="card"
        style={{ padding: 12, fontSize: 16 }}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <button className="btn" type="submit">
        Create Contest
      </button>
    </form>
  );
}
