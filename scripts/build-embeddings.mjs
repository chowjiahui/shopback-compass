// Build-time: embed the full ShopBack catalogue once into a committed artifact.
// Run: node --env-file=.env.local scripts/build-embeddings.mjs
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.EMBEDDING_API_KEY;
const MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const DIMS = Number(process.env.EMBEDDING_DIMS || 256);
if (!KEY) throw new Error("EMBEDDING_API_KEY not set (use --env-file=.env.local)");

const dataDir = path.join(process.cwd(), "public", "data");
const catalogue = JSON.parse(fs.readFileSync(path.join(dataDir, "catalogue.json"), "utf8"));

// Embed "name — slug words" so the vector carries category signal, not just a brand token.
const texts = catalogue.map((c) => `${c.name} — ${c.slug.replace(/-/g, " ")}`);

function normalize(v) {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  return v.map((x) => Math.round((x / n) * 1e5) / 1e5);
}

async function embedBatch(inputs) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: inputs, dimensions: DIMS }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data.map((d) => d.embedding);
}

const stores = [];
const BATCH = 256;
for (let i = 0; i < texts.length; i += BATCH) {
  const vecs = await embedBatch(texts.slice(i, i + BATCH));
  vecs.forEach((v, j) => stores.push({ slug: catalogue[i + j].slug, v: normalize(v) }));
  process.stdout.write(`  embedded ${Math.min(i + BATCH, texts.length)}/${texts.length}\r`);
}

const out = { model: MODEL, dim: DIMS, stores };
fs.writeFileSync(path.join(dataDir, "store_vectors.json"), JSON.stringify(out));
console.log(`\nwrote store_vectors.json — ${stores.length} vectors × ${DIMS}d`);
