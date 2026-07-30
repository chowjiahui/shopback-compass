import type { PlanData } from "@/lib/types";
import { computeRollup } from "@/lib/ranking";
import { SubNeedRow } from "./SubNeedRow";
import { ValueRollup } from "./ValueRollup";

export function PlanBoard({ plan }: { plan: PlanData }) {
  const rollup = computeRollup(plan.sub_needs);
  return (
    <div className="wrap" style={{ padding: "40px 24px 72px" }}>
      <div className="kicker" style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>
        Your Compass plan
      </div>
      <h2 style={{ fontSize: 30, margin: "6px 0 4px" }}>{plan.label}</h2>
      <p className="muted" style={{ maxWidth: "60ch", marginTop: 0 }}>
        Assembled from ShopBack&apos;s real store catalogue, ranked by cashback — including the parts most people forget.
      </p>
      {plan.sub_needs.map((sn) => (
        <SubNeedRow key={sn.name} name={sn.name} stores={sn.stores} />
      ))}
      <ValueRollup data={rollup} />
    </div>
  );
}
