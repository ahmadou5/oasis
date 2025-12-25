import type { RecentBlock } from "./recentBlocks.service";

export interface FetchRecentBlocksFromGeyserParams {
  limit?: number;
  // Example: "https://your-geyser-provider:443" (or "http://..." depending on provider)
  geyserGrpcUrl?: string;
  // Auth token / headers will depend on provider
  geyserToken?: string;
}

/**
 * Geyser gRPC integration scaffold.
 *
 * Why a scaffold?
 * - In Next.js serverless/edge environments, keeping a long-lived gRPC stream is non-trivial.
 * - Different providers expose different proto services (Yellowstone, Triton, custom).
 * - We don’t want to introduce a hard dependency that breaks builds without credentials.
 *
 * Recommended production design:
 * - Run a separate Node service (or Next.js node runtime with a singleton) that maintains a stream,
 *   keeps a ring buffer of the last N blocks in memory/Redis, and this app reads from that cache.
 */
export async function fetchRecentBlocksFromGeyser(
  _params: FetchRecentBlocksFromGeyserParams = {}
): Promise<RecentBlock[]> {
  // If you want, we can implement a concrete provider once you share:
  // 1) Provider name (Helius/Triton/Yellowstone/etc)
  // 2) gRPC URL
  // 3) auth mechanism
  // 4) which stream message includes block meta you need
  throw new Error(
    "Geyser gRPC recent blocks is not configured yet. Set up a gRPC provider and implement provider-specific client."
  );
}
