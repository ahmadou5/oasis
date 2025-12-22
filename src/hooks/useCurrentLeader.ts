import { useState, useEffect, useCallback } from "react";
import { ENV } from "../config/env";
import { Connection } from "@solana/web3.js";
interface UseCurrentLeaderOptions {
  rpcEndpoint?: string;
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface LeaderState {
  publicKey: string | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export const useCurrentLeader = ({
  rpcEndpoint = ENV.SOLANA.RPC_ENDPOINTS.MAINNET,
  refreshInterval = 3000, // 3 seconds
  enabled = true,
}: UseCurrentLeaderOptions = {}): LeaderState => {
  const [leaderState, setLeaderState] = useState<LeaderState>({
    publicKey: null,
    loading: true,
    error: null,
    lastUpdate: null,
  });

  const fetchCurrentLeader = useCallback(async () => {
    if (!enabled) return;
    const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET, {
      commitment: "confirmed",
    });
    const leader = await connection.getSlotLeader();

    try {
      const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET, {
        commitment: "confirmed",
      });
      const leader = await connection.getSlotLeader();

      setLeaderState({
        publicKey: leader,
        loading: false,
        error: null,
        lastUpdate: new Date(),
      });
    } catch (err) {
      console.error("Error fetching current leader:", err);
      setLeaderState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [rpcEndpoint, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLeaderState({
        publicKey: null,
        loading: false,
        error: null,
        lastUpdate: null,
      });
      return;
    }

    // Initial fetch
    fetchCurrentLeader();

    // Set up interval
    const interval = setInterval(fetchCurrentLeader, refreshInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [fetchCurrentLeader, refreshInterval, enabled]);

  return leaderState;
};
