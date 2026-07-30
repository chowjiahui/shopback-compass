import type { Store } from "@/lib/types";
import { tileStyle } from "@/lib/ui";

function RateLine({ store }: { store: Store }) {
  if (store.rate_value == null || store.rate_kind == null) {
    return <div className="rate none">Cashback available</div>;
  }
  const amount = store.rate_kind === "pct" ? `${store.rate_value}%` : `S$${store.rate_value}`;
  return (
    <div className="rate">
      {store.rate_up_to && <span className="up">Up to </span>}
      {amount} <span className="up">cashback</span>
    </div>
  );
}

export function MerchantCard({ store }: { store: Store }) {
  return (
    <a className="card" href={store.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="tile" style={tileStyle(store.slug)}>
        {store.rate_up_to && store.rate_kind && <span className="badge">Upsized</span>}
        <span
          className="logo"
          style={{ color: "#fff", padding: "0 14px", textAlign: "center", lineHeight: 1.15, fontSize: store.name.length > 16 ? 16 : 20 }}
        >
          {store.name}
        </span>
      </div>
      <div className="body">
        <div className="store">{store.name}</div>
        <RateLine store={store} />
        {store.fine_print && <div className="why">{store.fine_print}</div>}
      </div>
    </a>
  );
}
