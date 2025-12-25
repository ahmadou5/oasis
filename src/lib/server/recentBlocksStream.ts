import { fetchRecentBlocksFromRpc } from "@/lib/services/recentBlocks.service";
import { fetchRecentBlocksFromGeyser } from "@/lib/services/geyserRecentBlocks.service";

type Source = "rpc" | "geyser";

export interface RecentBlocksStreamPayload {
  blocks: unknown;
  source: Source;
  lastUpdate: number;
}

type Subscriber = (payload: RecentBlocksStreamPayload) => void;

class RecentBlocksStream {
  private subscribers = new Set<Subscriber>();
  private timer: NodeJS.Timeout | null = null;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  private lastTopSlot: number | null = null;
  private inFlight: Promise<void> | null = null;

  // Poll interval should be near block time but not too aggressive
  private pollMs = parseInt(process.env.RECENT_BLOCKS_STREAM_POLL_MS || "400");
  private limit = parseInt(process.env.RECENT_BLOCKS_STREAM_LIMIT || "10");

  subscribe(fn: Subscriber) {
    this.subscribers.add(fn);
    this.ensureRunning();
    return () => {
      this.subscribers.delete(fn);
      this.maybeStop();
    };
  }

  private ensureRunning() {
    if (this.timer) return;

    // main poll loop
    this.timer = setInterval(() => {
      void this.tick();
    }, this.pollMs);

    // send keep-alive payload (clients also get SSE comments from route)
    this.keepAliveTimer = setInterval(() => {
      if (this.subscribers.size === 0) return;
      this.broadcast({
        blocks: null,
        source: "rpc",
        lastUpdate: Date.now(),
      });
    }, 15000);

    // kick immediately
    void this.tick();
  }

  private maybeStop() {
    if (this.subscribers.size > 0) return;
    if (this.timer) clearInterval(this.timer);
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    this.timer = null;
    this.keepAliveTimer = null;
    this.lastTopSlot = null;
    this.inFlight = null;
  }

  private broadcast(payload: RecentBlocksStreamPayload) {
    for (const fn of this.subscribers) {
      try {
        fn(payload);
      } catch {
        // ignore subscriber errors
      }
    }
  }

  private async tick() {
    if (this.inFlight) return;
    this.inFlight = (async () => {
      try {
        const enableGeyser = process.env.ENABLE_GEYSER_RECENT_BLOCKS === "true";
        let source: Source = "rpc";
        let blocks: any = null;

        if (enableGeyser) {
          try {
            blocks = await fetchRecentBlocksFromGeyser({
              limit: this.limit,
              geyserGrpcUrl: process.env.GEYSER_GRPC_URL,
              geyserToken: process.env.GEYSER_GRPC_TOKEN,
            });
            source = "geyser";
          } catch {
            blocks = null;
          }
        }

        if (!blocks) {
          blocks = await fetchRecentBlocksFromRpc({ limit: this.limit });
          source = "rpc";
        }

        const topSlot = Array.isArray(blocks) && blocks.length > 0 ? blocks[0].slot : null;

        // Only broadcast when the latest slot changes (real-time feel)
        if (topSlot !== null && topSlot !== this.lastTopSlot) {
          this.lastTopSlot = topSlot;
          this.broadcast({
            blocks,
            source,
            lastUpdate: Date.now(),
          });
        }
      } finally {
        this.inFlight = null;
      }
    })();

    await this.inFlight;
  }
}

let singleton: RecentBlocksStream | null = null;

export function getRecentBlocksStream() {
  if (!singleton) singleton = new RecentBlocksStream();
  return singleton;
}
