export type RateKind = "pct" | "dollar" | null;

export interface Store {
  slug: string;
  name: string;
  url: string;
  rate_kind: RateKind;
  rate_value: number | null;
  rate_up_to: boolean;
  rate_display: string | null;
  fine_print: string | null;
}

export interface SubNeed {
  name: string;
  stores: Store[];
}

export interface Intent {
  key: string;
  label: string;
  sub_needs: SubNeed[];
}

export interface PlanData {
  label: string;
  sub_needs: SubNeed[];
}

export interface CatalogueEntry {
  slug: string;
  name: string;
  url: string;
}
