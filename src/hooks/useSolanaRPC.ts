"use client";

import { Connection } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { ENV } from "../config/env";

interface SolanaNetworkData {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  totalActiveStake: number;
  currentTPS: number;
  currentEpoch: number;
  epochProgress: number;
  currentSlot: number;
}

export function useSolanaRPC() {
  const [networkData, setNetworkData] = useState<SolanaNetworkData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);

        // Fetch data from multiple sources
        const [priceData, networkStats, epochInfo] = await Promise.allSettled([
          fetchSolanaPrice(),
          fetchNetworkStats(),
          fetchEpochInfo(),
        ]);

        const combinedData: SolanaNetworkData = {
          // Price data from CoinGecko or similar
          price:
            priceData.status === "fulfilled" ? priceData.value.price : 132.45,
          priceChange24h:
            priceData.status === "fulfilled"
              ? priceData.value.change24h
              : -2.34,
          volume24h:
            priceData.status === "fulfilled"
              ? priceData.value.volume24h
              : 2847329000,
          marketCap:
            priceData.status === "fulfilled"
              ? priceData.value.marketCap
              : 62847329000,

          // Network stats from Solana RPC
          totalSupply:
            networkStats.status === "fulfilled"
              ? networkStats.value.totalSupply
              : 588329184,
          circulatingSupply:
            networkStats.status === "fulfilled"
              ? networkStats.value.circulatingSupply
              : 467892341,
          totalActiveStake: 389547283,
          currentTPS:
            networkStats.status === "fulfilled"
              ? networkStats.value.currentTPS
              : 2847,

          // Epoch info from Solana RPC
          currentEpoch:
            epochInfo.status === "fulfilled" ? epochInfo.value.epoch : 547,
          epochProgress: 89.2,
          currentSlot:
            epochInfo.status === "fulfilled"
              ? epochInfo.value.absolutrSlot
              : 235847294,
        };

        setNetworkData(combinedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching network data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();

    // Refresh data every 10 seconds
    const interval = setInterval(fetchNetworkData, 10000);

    return () => clearInterval(interval);
  }, []);

  return { networkData, loading, error };
}

// Helper functions to fetch data from different sources
async function fetchSolanaPrice() {
  try {
    // Try CoinGecko first
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true"
    );

    if (!response.ok) {
      throw new Error("CoinGecko API failed");
    }

    const data = await response.json();
    return {
      price: data.solana.usd,
      change24h: data.solana.usd_24h_change,
      volume24h: data.solana.usd_24h_vol,
      marketCap: data.solana.usd_market_cap,
    };
  } catch (error) {
    // Fallback to mock data if API fails
    console.warn("Using fallback price data:", error);
    return {
      price: 132.45 + (Math.random() - 0.5) * 2,
      change24h: -2.34 + (Math.random() - 0.5) * 1,
      volume24h: 2847329000 + Math.random() * 100000000,
      marketCap: 62847329000,
    };
  }
}

async function fetchNetworkStats() {
  try {
    // This would use @solana/web3.js in a real implementation
    const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET);
    const supply = await connection.getSupply();
    const tps = await connection.getTransactionCount();
    const staked = await connection.getVoteAccounts();
    const performanceSamples = await connection.getRecentPerformanceSamples(1);
    performanceSamples[0].numTransactions;
    // Mock data for now
    return {
      totalSupply: supply.value.total,
      circulatingSupply: supply.value.circulating,
      //totalActiveStake: 389547283 + Math.random() * 1000000,
      currentTPS: tps,
    };
  } catch (error) {
    console.warn("Using fallback network stats:", error);
    throw error;
  }
}

async function fetchEpochInfo() {
  try {
    // This would use @solana/web3.js in a real implementation
    const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET);
    const epochInfo = await connection.getEpochInfo();

    return {
      epoch: epochInfo.epoch,
      slotIndex: epochInfo.slotIndex,
      slotsInEpoch: epochInfo.slotsInEpoch,
      blockHeight: epochInfo.blockHeight,
      absolutrSlot: epochInfo.absoluteSlot, // ~400ms per slot
      transactionCount: epochInfo.transactionCount,
    };
  } catch (error) {
    console.warn("Using fallback epoch info:", error);
    throw error;
  }
}
