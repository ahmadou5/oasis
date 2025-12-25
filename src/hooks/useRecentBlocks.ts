"use client";

import { useState, useEffect, useCallback } from "react";

interface RecentBlock {
  slot: number;
  blockhash: string;
  blockTime: number | null;
  parentSlot: number;
  transactions: number;
  validatorIdentity: string | null;
  validatorVoteAccount: string | null;
  rewards: Array<{
    pubkey: string;
    lamports: number;
    rewardType: string | null;
  }>;
}

interface UseRecentBlocksReturn {
  blocks: RecentBlock[];
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}

export function useRecentBlocks(maxBlocks: number = 20): UseRecentBlocksReturn {
  const [blocks, setBlocks] = useState<RecentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const fetchRecentBlocks = useCallback(async () => {
    try {
      const res = await fetch(`/api/recent-blocks?limit=${maxBlocks}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch blocks (HTTP ${res.status})`);
      }

      const json = (await res.json()) as {
        blocks: RecentBlock[];
        source: "rpc" | "geyser";
        cached: boolean;
        lastUpdate: number;
      };

      setBlocks(Array.isArray(json.blocks) ? json.blocks : []);
      setError(null);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error("Error fetching recent blocks:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch blocks");
    } finally {
      setLoading(false);
    }
  }, [maxBlocks]);

  // Initial fetch
  useEffect(() => {
    fetchRecentBlocks();
  }, [fetchRecentBlocks]);

  // Prefer Server-Sent Events (push) for real-time feel.
  // Fall back to polling if SSE is unavailable or errors.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let es: EventSource | null = null;

    const startPolling = () => {
      if (interval) return;
      interval = setInterval(() => {
        fetchRecentBlocks();
      }, 1000);
    };

    try {
      if (typeof window !== "undefined" && "EventSource" in window) {
        es = new EventSource("/api/recent-blocks/stream");

        es.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data) as any;
            if (msg?.type === "blocks" && Array.isArray(msg.blocks)) {
              setBlocks(msg.blocks);
              setError(null);
              setLastUpdate(Date.now());
              setLoading(false);
            }
          } catch {
            // ignore malformed messages
          }
        };

        es.onerror = () => {
          // Some platforms/proxies don't support SSE reliably.
          // Close and fall back to polling.
          es?.close();
          es = null;
          startPolling();
        };
      } else {
        startPolling();
      }
    } catch {
      startPolling();
    }

    return () => {
      if (es) es.close();
      if (interval) clearInterval(interval);
    };
  }, [fetchRecentBlocks]);

  return {
    blocks,
    loading,
    error,
    lastUpdate,
  };
}
