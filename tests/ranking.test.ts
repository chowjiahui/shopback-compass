import { describe, it, expect } from "vitest";
import { rankStores, computeRollup } from "../src/lib/ranking";
import type { Store } from "../src/lib/types";

const s = (o: { slug: string; k?: "pct" | "dollar"; v?: number }): Store => ({
  slug: o.slug,
  name: o.slug,
  url: "",
  rate_kind: o.k ?? null,
  rate_value: o.v ?? null,
  rate_up_to: false,
  rate_display: null,
  fine_print: null,
});

describe("rankStores", () => {
  it("puts higher rates first and unrated last, stably", () => {
    const out = rankStores([
      s({ slug: "a", k: "pct", v: 4 }),
      s({ slug: "b" }),
      s({ slug: "c", k: "pct", v: 25 }),
      s({ slug: "d", k: "dollar", v: 15 }),
    ]);
    expect(out.map((x) => x.slug)).toEqual(["c", "d", "a", "b"]);
  });
});

describe("computeRollup", () => {
  it("sums flat dollar bounties and counts blind spots", () => {
    const r = computeRollup([
      { name: "Hotels", stores: [s({ slug: "h", k: "pct", v: 4 })] },
      {
        name: "Travel insurance",
        stores: [s({ slug: "i", k: "dollar", v: 15 }), s({ slug: "j", k: "dollar", v: 35 })],
      },
    ]);
    expect(r.flatCashback).toBe(50);
    expect(r.storeCount).toBe(3);
    expect(r.blindSpotCount).toBe(2);
  });
});
