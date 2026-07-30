"use client";
import { useState } from "react";
import type { Intent, PlanData } from "@/lib/types";
import { IntentBar } from "./IntentBar";
import { PlanBoard } from "./PlanBoard";

const HOW = [
  ["Tell us the goal", "A trip, a new home, a big purchase — in your own words."],
  ["We decompose it", "Into everything you'll need, including the parts people forget."],
  ["Ranked by cashback", "Real ShopBack stores, best value first, one place to act."],
];

export function CompassApp({ intents }: { intents: Record<string, Intent> }) {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const suggestions = Object.values(intents).map((i) => ({ key: i.key, label: i.label }));

  function pick(key: string) {
    setNote(null);
    setPlan(intents[key]);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(text: string) {
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: text }),
      });
      const data: PlanData = await res.json();
      if (!data.sub_needs?.length) {
        setNote("Couldn't map that one to our catalogue yet — try one of these:");
        setPlan(null);
      } else {
        setPlan(data);
      }
    } catch {
      setNote("Something went wrong building that plan — try one of these:");
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <IntentBar suggestions={suggestions} onSubmit={submit} onPick={pick} loading={loading} />
      {note && (
        <div className="wrap" style={{ paddingTop: 24 }}>
          <p className="muted">{note}</p>
        </div>
      )}
      {plan ? (
        <PlanBoard plan={plan} />
      ) : (
        <section className="wrap" style={{ padding: "48px 24px 72px" }}>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {HOW.map(([t, d], i) => (
              <div key={t} style={{ padding: "4px 2px" }}>
                <div style={{ color: "var(--accent)", fontWeight: 800, fontSize: 22 }}>{i + 1}</div>
                <h3 style={{ fontSize: 18, margin: "6px 0 4px" }}>{t}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14.5 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
