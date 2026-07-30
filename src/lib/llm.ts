import type { CatalogueEntry, SubNeed } from "./types";

export interface LlmSubNeed {
  name: string;
  slugs: string[];
}

/** Keep only slugs that really exist in the catalogue; drop empty sub-needs.
 * Free-text stores carry null rates (UI shows "Cashback available"); this is
 * the guardrail that stops the model inventing stores, rates, or fine print. */
export function groundToCatalogue(
  llmSubNeeds: LlmSubNeed[],
  catalogue: CatalogueEntry[]
): SubNeed[] {
  const byslug = new Map(catalogue.map((c) => [c.slug, c]));
  const out: SubNeed[] = [];
  for (const sn of llmSubNeeds) {
    const seen = new Set<string>();
    const stores = [];
    for (const slug of sn.slugs) {
      const c = byslug.get(slug);
      if (!c || seen.has(slug)) continue;
      seen.add(slug);
      stores.push({
        slug: c.slug,
        name: c.name,
        url: c.url,
        rate_kind: null,
        rate_value: null,
        rate_up_to: false,
        rate_display: null,
        fine_print: null,
      });
    }
    if (stores.length) out.push({ name: sn.name, stores });
  }
  return out;
}

const SYSTEM = `You are a shopping-plan assistant for ShopBack Singapore.
Given a user's goal, decompose it into 4-8 clearly-labelled sub-needs. ALWAYS
include the easily-forgotten ones where relevant (insurance, connectivity/eSIM,
a funding card). For each sub-need, choose up to 6 relevant stores by their slug
FROM THE PROVIDED CATALOGUE ONLY. Never invent a slug. Return strict JSON:
{"sub_needs":[{"name":"...","slugs":["slug1","slug2"]}]}`;

/** Call the configured OpenAI-compatible LLM to decompose a free-text intent.
 * Env: LLM_BASE_URL, LLM_API_KEY, LLM_MODEL (defaults suit DeepSeek). */
export async function callLLM(
  intent: string,
  catalogue: CatalogueEntry[]
): Promise<{ sub_needs: LlmSubNeed[] }> {
  const base = process.env.LLM_BASE_URL || "https://api.deepseek.com";
  const model = process.env.LLM_MODEL || "deepseek-chat";
  const key = process.env.LLM_API_KEY;
  if (!key) throw new Error("LLM_API_KEY not set");

  // Compact catalogue for the prompt (slug + name keeps grounding cheap).
  const list = catalogue.map((c) => `${c.slug} | ${c.name}`).join("\n");

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `GOAL: ${intent}\n\nCATALOGUE (slug | name):\n${list}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  return { sub_needs: Array.isArray(parsed.sub_needs) ? parsed.sub_needs : [] };
}
