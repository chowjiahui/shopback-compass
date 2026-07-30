import type { CatalogueEntry, Store } from "./types";

/** Turn ranked slug hits into real Store objects: names/urls from the catalogue,
 * rates merged from the scraped set when known. Unknown slugs are dropped —
 * stores can only ever come from the real catalogue (the grounding guarantee). */
export function mergeStores(
  hits: { slug: string; score: number }[],
  catalogue: CatalogueEntry[],
  rated: Store[]
): Store[] {
  const cat = new Map(catalogue.map((c) => [c.slug, c]));
  const rate = new Map(rated.filter((r) => r.rate_value != null).map((r) => [r.slug, r]));
  const out: Store[] = [];
  for (const h of hits) {
    const c = cat.get(h.slug);
    if (!c) continue;
    const r = rate.get(h.slug);
    out.push({
      slug: c.slug,
      name: c.name,
      url: c.url,
      rate_kind: r?.rate_kind ?? null,
      rate_value: r?.rate_value ?? null,
      rate_up_to: r?.rate_up_to ?? false,
      rate_display: r?.rate_display ?? null,
      fine_print: r?.fine_print ?? null,
    });
  }
  return out;
}

/** Relevance gate for a sub-need's ranked hits. Thresholds calibrated on real
 * text-embedding-3-small scores: well-covered sub-needs top out ≥0.55, ones the
 * catalogue can't serve top out ~0.49 — so a section whose BEST match is below
 * `sectionMinTop` is dropped entirely (no filler cards), and within a kept
 * section tail matches below `cardMin` are trimmed, capped at `maxK`. */
export function selectHits(
  hits: { slug: string; score: number }[],
  { sectionMinTop = 0.5, cardMin = 0.42, maxK = 6 } = {}
): { slug: string; score: number }[] {
  if (!hits.length || hits[0].score < sectionMinTop) return [];
  return hits.filter((h) => h.score >= cardMin).slice(0, maxK);
}

/** Embed free-text queries via the configured OpenAI-compatible endpoint. */
export async function embedQueries(texts: string[]): Promise<number[][]> {
  const key = process.env.EMBEDDING_API_KEY;
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
  const dims = Number(process.env.EMBEDDING_DIMS || 256);
  if (!key) throw new Error("EMBEDDING_API_KEY not set");
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: texts, dimensions: dims }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}`);
  const json = await res.json();
  return json.data.map((d: { embedding: number[] }) => d.embedding);
}
