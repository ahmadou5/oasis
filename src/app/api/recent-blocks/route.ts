import { NextResponse } from "next/server";
import { fetchRecentBlocksFromRpc } from "@/lib/services/recentBlocks.service";
import { fetchRecentBlocksFromGeyser } from "@/lib/services/geyserRecentBlocks.service";

export const dynamic = "force-dynamic";

type Source = "rpc" | "geyser";

interface CacheEntry {
  expiresAt: number;
  data: unknown;
  source: Source;
}

const CACHE_TTL_MS = parseInt(process.env.RECENT_BLOCKS_CACHE_TTL_MS || "800");

let cache: CacheEntry | null = null;
let inFlight: Promise<CacheEntry> | null = null;

function parseLimit(url: URL): number {
  const raw = url.searchParams.get("limit") ?? url.searchParams.get("maxBlocks");
  const n = raw ? parseInt(raw) : 10;
  if (!Number.isFinite(n)) return 10;
  return Math.max(1, Math.min(n, 50));
}

async function loadRecentBlocks(limit: number): Promise<CacheEntry> {
  const enableGeyser = process.env.ENABLE_GEYSER_RECENT_BLOCKS === "true";

  if (enableGeyser) {
    try {
      const blocks = await fetchRecentBlocksFromGeyser({
        limit,
        geyserGrpcUrl: process.env.GEYSER_GRPC_URL,
        geyserToken: process.env.GEYSER_GRPC_TOKEN,
      });
      return {
        expiresAt: Date.now() + CACHE_TTL_MS,
        data: blocks,
        source: "geyser",
      };
    } catch (e) {
      // Fall back to RPC below
      console.warn("Geyser recent blocks failed, falling back to RPC:", e);
    }
  }

  const blocks = await fetchRecentBlocksFromRpc({ limit });
  return {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data: blocks,
    source: "rpc",
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseLimit(url);

    const now = Date.now();
    if (cache && cache.expiresAt > now) {
      return NextResponse.json({
        blocks: cache.data,
        source: cache.source,
        cached: true,
        lastUpdate: now,
      });
    }

    if (!inFlight) {
      inFlight = loadRecentBlocks(limit).finally(() => {
        inFlight = null;
      });
    }

    cache = await inFlight;

    return NextResponse.json({
      blocks: cache.data,
      source: cache.source,
      cached: false,
      lastUpdate: now,
    });
  } catch (error: any) {
    console.error("Error in /api/recent-blocks:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch recent blocks", details: error?.message },
      { status: 500 }
    );
  }
}
