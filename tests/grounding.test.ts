import { describe, it, expect } from "vitest";
import { groundToCatalogue } from "../src/lib/llm";
import type { CatalogueEntry } from "../src/lib/types";

const cat: CatalogueEntry[] = [
  { slug: "agoda", name: "Agoda", url: "https://www.shopback.sg/agoda" },
  { slug: "klook-promo-code", name: "Klook", url: "https://www.shopback.sg/klook-promo-code" },
];

describe("groundToCatalogue", () => {
  it("drops hallucinated slugs and empty sub-needs", () => {
    const out = groundToCatalogue(
      [
        { name: "Hotels", slugs: ["agoda", "made-up-hotel"] },
        { name: "Nothing real", slugs: ["also-fake"] },
      ],
      cat
    );
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe("Hotels");
    expect(out[0].stores.map((s) => s.slug)).toEqual(["agoda"]);
    expect(out[0].stores[0].name).toBe("Agoda");
    expect(out[0].stores[0].rate_value).toBeNull();
  });
});
