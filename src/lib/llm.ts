export interface DecomposedSubNeed {
  name: string;
  query: string;
}

const SYSTEM = `You are a shopping-plan assistant for ShopBack Singapore, a CASHBACK
platform whose merchants are ONLINE RETAILERS and product brands (not local
service providers like photographers or venues).
Decompose the user's goal into 4-8 sub-needs that map to things you actually BUY
from online stores. Skip purely local-service needs. ALWAYS include the
easily-forgotten buyable ones where relevant: travel/home insurance,
connectivity (eSIM/broadband), and a funding credit card.
The "query" must be a SPECIFIC retailer-type noun phrase used for a similarity
search over store names — name the kind of shop/brand, e.g. "robot vacuum and
home appliance stores", "bridal gown and formalwear retailers", "travel
insurance providers", "pet food and supplies shops". Avoid vague labels.
Output STRICT JSONL — one JSON object per line, no surrounding array, no code
fences, no prose. Each line:
{"name":"<short label>","query":"<specific retailer-type phrase>"}`;

function tryParseSubNeed(raw: string): DecomposedSubNeed | null {
  let s = raw.replace(/^```(json)?/i, "").replace(/```$/, "").trim().replace(/,\s*$/, "");
  if (!s.startsWith("{")) return null;
  try {
    const o = JSON.parse(s);
    if (o && typeof o.name === "string" && typeof o.query === "string") {
      return { name: o.name, query: o.query };
    }
  } catch {
    /* partial or non-JSON line — skip */
  }
  return null;
}

/** Stream the goal decomposition, yielding each sub-need as its JSONL line
 * completes. No catalogue in the prompt — that keeps this call small and fast. */
export async function* streamDecompose(intent: string): AsyncGenerator<DecomposedSubNeed> {
  const base = process.env.LLM_BASE_URL || "https://api.deepseek.com";
  const model = process.env.LLM_MODEL || "deepseek-chat";
  const key = process.env.LLM_API_KEY;
  if (!key) throw new Error("LLM_API_KEY not set");

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `GOAL: ${intent}` },
      ],
    }),
  });
  if (!res.ok || !res.body) throw new Error(`LLM ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let sse = "";
  let line = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    sse += decoder.decode(value, { stream: true });
    const events = sse.split("\n");
    sse = events.pop() ?? "";
    for (const ev of events) {
      const t = ev.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") continue;
      let delta = "";
      try {
        delta = JSON.parse(payload).choices?.[0]?.delta?.content ?? "";
      } catch {
        continue;
      }
      line += delta;
      let nl: number;
      while ((nl = line.indexOf("\n")) >= 0) {
        const parsed = tryParseSubNeed(line.slice(0, nl));
        line = line.slice(nl + 1);
        if (parsed) yield parsed;
      }
    }
  }
  const last = tryParseSubNeed(line);
  if (last) yield last;
}
