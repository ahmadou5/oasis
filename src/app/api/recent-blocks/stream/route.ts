import { getRecentBlocksStream } from "@/lib/server/recentBlocksStream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let unsubscribe: (() => void) | null = null;
  let keepAlive: NodeJS.Timeout | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (obj: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      // Initial hello
      send({ type: "hello", ts: Date.now() });

      unsubscribe = getRecentBlocksStream().subscribe((payload) => {
        if (payload.blocks) {
          send({ type: "blocks", ...payload });
        }
      });

      keepAlive = setInterval(() => {
        // SSE comment line to keep proxies from buffering/closing
        controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
      }, 15000);
    },
    cancel() {
      if (keepAlive) clearInterval(keepAlive);
      if (unsubscribe) unsubscribe();
      keepAlive = null;
      unsubscribe = null;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
