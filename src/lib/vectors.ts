export interface Vec {
  slug: string;
  v: number[];
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

/** Nearest `k` vectors to `query` by cosine, highest score first. */
export function topK(query: number[], index: Vec[], k: number): { slug: string; score: number }[] {
  return index
    .map((e) => ({ slug: e.slug, score: cosine(query, e.v) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
