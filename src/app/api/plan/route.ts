import { loadCatalogue, loadRatedStores, loadVectorIndex } from "@/lib/data";
import { streamDecompose } from "@/lib/llm";
import { embedQueries, mergeStores, selectHits } from "@/lib/retrieval";
import { topK } from "@/lib/vectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Pin to Singapore — closest to the SG demo audience and to the Asia-based LLM.
export const preferredRegion = "sin1";

/** Two-stage streaming plan:
 *  Stage 1 (LLM) streams sub-needs; for each, Stage 2 embeds the query, does a
 *  cosine top-k over the committed catalogue index, merges real rates, and
 *  streams that finished sub-need to the client as one NDJSON line. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const intent = String(body?.intent ?? "").trim();
  if (!intent) return new Response("", { status: 400 });

  const index = loadVectorIndex();
  const catalogue = loadCatalogue();
  const rated = loadRatedStores();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const write = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      // Each sub-need's embed + retrieve runs concurrently the moment it streams
      // in, and writes as soon as it resolves — so total ≈ Stage-1 + one embed,
      // not Stage-1 + N embeds.
      const tasks: Promise<void>[] = [];
      try {
        for await (const sn of streamDecompose(intent)) {
          tasks.push(
            (async () => {
              try {
                const [qv] = await embedQueries([sn.query]);
                const hits = selectHits(topK(qv, index, 10));
                const stores = mergeStores(hits, catalogue, rated);
                if (stores.length) write({ name: sn.name, stores });
              } catch (e) {
                console.error("sub-need retrieval failed:", e);
              }
            })()
          );
        }
        await Promise.all(tasks);
      } catch (err) {
        console.error("/api/plan stream failed:", err);
        write({ error: true });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
