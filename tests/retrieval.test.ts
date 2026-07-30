import { describe, it, expect } from "vitest";
import { mergeStores } from "../src/lib/retrieval";
import type { CatalogueEntry, Store } from "../src/lib/types";

const catalogue: CatalogueEntry[] = [
  { slug: "agoda", name: "Agoda", url: "https://www.shopback.sg/agoda" },
  { slug: "sonno", name: "Sonno", url: "https://www.shopback.sg/sonno" },
];
const rated: Store[] = [
  { slug: "agoda", name: "Agoda", url: "", rate_kind: "pct", rate_value: 4.5, rate_up_to: true, rate_display: "Up to 4.5% cashback", fine_print: "hotel portion only" },
];

describe("mergeStores", () => {
  it("attaches real rates when known, nulls otherwise, and drops unknown slugs", () => {
    const out = mergeStores(
      [{ slug: "agoda", score: 0.9 }, { slug: "sonno", score: 0.7 }, { slug: "ghost", score: 0.6 }],
      catalogue,
      rated
    );
    expect(out.map((s) => s.slug)).toEqual(["agoda", "sonno"]); // "ghost" dropped (grounding)
    expect(out[0].rate_value).toBe(4.5);
    expect(out[0].rate_display).toBe("Up to 4.5% cashback");
    expect(out[1].rate_value).toBeNull(); // sonno known store, no scraped rate
    expect(out[1].name).toBe("Sonno");
  });
});
