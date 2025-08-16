"use client";

import React, { useState } from "react";

export default function EditChallengePage() {
  // Mock initial data
  const [title, setTitle] = useState("Reverse Engineering 101");
  const [description, setDescription] = useState(
    "Analyze and break the binary."
  );
  const [difficulty, setDifficulty] = useState("Easy");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    alert("Challenge saved! (mock)");
  }

  return (
    <form
      onSubmit={handleSave}
      style={{
        maxWidth: 500,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <h1 className="glow" style={{ fontSize: "2rem" }}>
        Edit Challenge
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
        Save Challenge
      </button>
    </form>
  );
}
