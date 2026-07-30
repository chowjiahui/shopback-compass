import type { Store } from "@/lib/types";
import { rankStores } from "@/lib/ranking";
import { subNeedIcon } from "@/lib/ui";
import { MerchantCard } from "./MerchantCard";

export function SubNeedRow({ name, stores }: { name: string; stores: Store[] }) {
  const ranked = rankStores(stores);
  const blindSpot = /insurance|esim|connect|protect|card/i.test(name);
  return (
    <section>
      <div className="subhead">
        <span className="pin">{subNeedIcon(name)}</span>
        <h3>{name}</h3>
        <span className="tag">
          {ranked.length} option{ranked.length !== 1 ? "s" : ""}
          {blindSpot ? " · easy to forget" : " · ranked by value"}
        </span>
      </div>
      <div className="grid">
        {ranked.map((s) => (
          <MerchantCard key={s.slug} store={s} />
        ))}
      </div>
    </section>
  );
}
