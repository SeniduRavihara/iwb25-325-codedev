"use client";

import React, { useState } from "react";

export default function AddChallengePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Challenge added! (mock)");
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
        Add Challenge
      </h1>
      <input
        className="card"
        style={{ padding: 12, fontSize: 16 }}
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="card"
        style={{ padding: 12, fontSize: 16, minHeight: 100 }}
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <select
        className="card"
        style={{ padding: 12, fontSize: 16 }}
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>
      <button className="btn" type="submit">
        Add Challenge
      </button>
    </form>
  );
}
