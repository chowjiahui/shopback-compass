import { describe, it, expect } from "vitest";
import { cosine, topK } from "../src/lib/vectors";

describe("cosine", () => {
  it("is 1 for identical direction, 0 for orthogonal", () => {
    expect(cosine([1, 0, 0], [2, 0, 0])).toBeCloseTo(1);
    expect(cosine([1, 0, 0], [0, 1, 0])).toBeCloseTo(0);
  });
});

describe("topK", () => {
  const index = [
    { slug: "a", v: [1, 0] },
    { slug: "b", v: [0.8, 0.6] },
    { slug: "c", v: [0, 1] },
  ];
  it("returns the nearest slugs first, limited to k", () => {
    const out = topK([1, 0.1], index, 2);
    expect(out.map((x) => x.slug)).toEqual(["a", "b"]);
    expect(out).toHaveLength(2);
    expect(out[0].score).toBeGreaterThan(out[1].score);
  });
});
