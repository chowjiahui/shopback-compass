import type { Store, SubNeed } from "./types";

// Within a sub-need the rate kind is uniform in the real data (all hotels %,
// all insurers $), so ranking by raw value orders same-kind correctly; any
// rated store beats an unrated one.
function score(s: Store): number {
  return s.rate_value == null ? -1 : s.rate_value;
}

/** Rated stores first (higher value first); unrated last; stable within ties. */
export function rankStores(stores: Store[]): Store[] {
  return stores
    .map((s, i) => ({ s, i }))
    .sort((a, b) => score(b.s) - score(a.s) || a.i - b.i)
    .map((x) => x.s);
}

export interface Rollup {
  flatCashback: number;
  storeCount: number;
  blindSpotCount: number;
  hoursSaved: number;
}

const BLIND_SPOT = /insurance|esim|connect|protect|card/i;

/** Headline numbers for the value roll-up. flatCashback sums only real, flat
 * dollar bounties (percentage cashback is basket-dependent, so it is shown
 * per-card rather than summed here). */
export function computeRollup(subNeeds: SubNeed[]): Rollup {
  const stores = subNeeds.flatMap((sn) => sn.stores);
  const flatCashback = stores
    .filter((s) => s.rate_kind === "dollar")
    .reduce((n, s) => n + (s.rate_value ?? 0), 0);
  const blindSpotCount = subNeeds
    .filter((sn) => BLIND_SPOT.test(sn.name))
    .flatMap((sn) => sn.stores).length;
  const storeCount = stores.length;
  return { flatCashback, storeCount, blindSpotCount, hoursSaved: Math.round(storeCount * 0.9) };
}
