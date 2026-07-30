"use client";
import { useState } from "react";

interface Suggestion {
  key: string;
  label: string;
}

export function IntentBar({
  suggestions,
  onSubmit,
  onPick,
  loading,
}: {
  suggestions: Suggestion[];
  onSubmit: (text: string) => void;
  onPick: (key: string) => void;
  loading?: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <header className="hero">
      <span className="spark" style={{ top: 26, left: "12%", fontSize: 22 }}>✦</span>
      <span className="spark" style={{ top: 120, right: "30%", fontSize: 15 }}>✦</span>
      <span className="spark" style={{ bottom: 40, left: "44%", fontSize: 20 }}>✦</span>
      <span className="coin" style={{ top: 60, right: "12%", width: 34, height: 34 }} />
      <span className="coin" style={{ bottom: 64, right: "22%", width: 24, height: 24 }} />
      <span className="coin" style={{ top: 150, left: "6%", width: 22, height: 22 }} />
      <div className="wrap" style={{ padding: "48px 24px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20, letterSpacing: "-.02em" }}>
          SHOPBACK
          <span style={{ width: 26, height: 26, borderRadius: 8, background: "#fff", color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 15 }}>⚡</span>
          <span style={{ opacity: 0.9, fontWeight: 700 }}>Compass</span>
        </div>
        <h1 style={{ fontSize: 52, margin: "22px 0 8px", maxWidth: "16ch" }}>
          Tell us what you want. We&apos;ll find the smartest way to get it.
        </h1>
        <p style={{ fontSize: 18, opacity: 0.92, maxWidth: "48ch", margin: "0 0 24px" }}>
          One goal in — a complete, cashback-ranked plan out, across everything you&apos;ll need.
        </p>
        <form
          className="searchbar"
          style={{ maxWidth: 640 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) onSubmit(text.trim());
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. planning a 10-day Japan trip in spring"
            aria-label="What do you want to get done?"
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Building…" : "Build my plan →"}
          </button>
        </form>
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <span style={{ opacity: 0.85, fontSize: 14, alignSelf: "center" }}>Try:</span>
          {suggestions.map((s) => (
            <button key={s.key} className="chip" onClick={() => onPick(s.key)} type="button">
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
