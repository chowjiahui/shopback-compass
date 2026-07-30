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
  const [streaming, setStreaming] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const suggestions = Object.values(intents).map((i) => ({ key: i.key, label: i.label }));

  function pick(key: string) {
    setNote(null);
    setStreaming(false);
    setPlan(intents[key]);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(text: string) {
    setLoading(true);
    setStreaming(true);
    setNote(null);
    setPlan({ label: text, sub_needs: [] });
    let count = 0;
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: text }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const obj = JSON.parse(line);
          if (obj.error) continue;
          count++;
          setPlan((p) => ({
            label: p?.label ?? text,
            sub_needs: [...(p?.sub_needs ?? []), { name: obj.name, stores: obj.stores }],
          }));
        }
      }
      if (count === 0) {
        setNote("Couldn't map that one to our catalogue yet — try one of these:");
        setPlan(null);
      }
    } catch {
      setNote("Something went wrong building that plan — try one of these:");
      setPlan(null);
    } finally {
      setLoading(false);
      setStreaming(false);
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
        <PlanBoard plan={plan} streaming={streaming} />
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
