/** Deterministic tile colour from a store slug (stable across renders). */
export function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function tileStyle(slug: string): React.CSSProperties {
  const h = hashHue(slug);
  return {
    background: `linear-gradient(135deg, hsl(${h} 66% 52%), hsl(${(h + 24) % 360} 70% 40%))`,
  };
}

const ICONS: [RegExp, string][] = [
  [/flight|air/i, "✈"],
  [/hotel|stay|accom/i, "🏨"],
  [/activit|pass|attraction|tour/i, "🎟"],
  [/insurance|protect/i, "🛡"],
  [/esim|connect|telco|broadband|sim/i, "📶"],
  [/card|forex|money|fund/i, "💳"],
  [/luggage|gear/i, "🧳"],
  [/car rental|rental/i, "🚗"],
  [/furnit/i, "🛋"],
  [/mattress|bedding|bed/i, "🛏"],
  [/applianc/i, "🔌"],
  [/kitchen/i, "🍳"],
  [/lock|security/i, "🔐"],
  [/decor|lighting/i, "💡"],
];

export function subNeedIcon(name: string): string {
  for (const [re, icon] of ICONS) if (re.test(name)) return icon;
  return "🛍";
}
