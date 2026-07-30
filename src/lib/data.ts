import fs from "node:fs";
import path from "node:path";
import type { CatalogueEntry, Intent, SubNeed } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T;
}

interface RawAppData {
  intents: Record<string, { label: string; sub_needs: SubNeed[] }>;
}

/** Load the two hero intents (real stores + scraped rates) keyed by intent key. */
export function loadIntents(): Record<string, Intent> {
  const raw = readJson<RawAppData>("app_data.json");
  const out: Record<string, Intent> = {};
  for (const [key, value] of Object.entries(raw.intents)) {
    out[key] = { key, label: value.label, sub_needs: value.sub_needs };
  }
  return out;
}

/** Load the slim full-catalogue list used to ground free-text intents. */
export function loadCatalogue(): CatalogueEntry[] {
  return readJson<CatalogueEntry[]>("catalogue.json");
}
