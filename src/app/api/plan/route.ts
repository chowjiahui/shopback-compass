import { NextResponse } from "next/server";
import { loadCatalogue } from "@/lib/data";
import { callLLM, groundToCatalogue } from "@/lib/llm";
import type { PlanData } from "@/lib/types";

export async function POST(req: Request) {
  let intent = "";
  try {
    const body = await req.json();
    intent = String(body?.intent ?? "").trim();
    if (!intent) return NextResponse.json({ label: "", sub_needs: [] } satisfies PlanData);

    const catalogue = loadCatalogue();
    const { sub_needs } = await callLLM(intent, catalogue);
    const grounded = groundToCatalogue(sub_needs, catalogue);
    return NextResponse.json({ label: intent, sub_needs: grounded } satisfies PlanData);
  } catch (err) {
    console.error("/api/plan failed:", err);
    // Degrade gracefully — the UI falls back to the hero-intent chips.
    return NextResponse.json({ label: intent, sub_needs: [] } satisfies PlanData);
  }
}
