"use client";

import React, { useState, useEffect, useMemo } from "react";
import { XandeumNodeWithMetrics } from "@/types";
import { Clock, RefreshCw } from "lucide-react";
import NetworkUptimeCard from "./NetworkUptimeCard";
import { HealthScoreCard } from "./HealthScoreCard";
import { StorageEfficiencyCard } from "./StorageCard";
import { PublicAccessCard } from "./PublicCard";
import { HealthDistribution } from "./HealthDistribution";
import { VersionDistribution } from "./VersionDistribution";
import TimeframeDropdown from "./TimeFrameDropdown";

interface NetworkStatsDashboardProps {
  pnodes: XandeumNodeWithMetrics[];
  refreshInterval?: number;
  onRefresh?: () => void;
  trendTimeframe?: number; // in milliseconds (default 5 minutes)
}

interface NetworkMetrics {
  totalNodes: number;
  onlineNodes: number;
  publicNodes: number;
  avgHealthScore: number;
  networkUptime: number;
  totalStorageCapacity: number;
  usedStorage: number;
  storageEfficiency: number;
  trends: {
    onlineChange: number;
    healthChange: number;
    storageChange: number;
  };
  /**
   * Whether we have enough historical snapshots to compute a trend for the selected timeframe.
   * When false, the UI should show "N/A" instead of implying a zero change.
   */
  trendsReady: boolean;
}

interface HistoricalSnapshot {
  timestamp: number;
  onlineNodes: number;
  avgHealthScore: number;
  storageEfficiency: number;
  totalNodes: number;
}

const SNAPSHOT_STORAGE_KEY = "xandeum_network_snapshots_v1";
const MAX_SNAPSHOT_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days (supports 7d trends reliably)

function safeLoadSnapshots(): HistoricalSnapshot[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    return parsed
      .filter(
        (s: any) =>
          s &&
          typeof s.timestamp === "number" &&
          typeof s.onlineNodes === "number" &&
          typeof s.avgHealthScore === "number" &&
          typeof s.storageEfficiency === "number" &&
          typeof s.totalNodes === "number" &&
          s.timestamp <= now
      )
      .filter((s: any) => s.timestamp > now - MAX_SNAPSHOT_AGE_MS)
      .sort((a: any, b: any) => a.timestamp - b.timestamp);
  } catch {
    return [];
  }
}

function safeSaveSnapshots(snapshots: HistoricalSnapshot[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SNAPSHOT_STORAGE_KEY,
      JSON.stringify(snapshots)
    );
  } catch {
    // ignore quota / privacy mode errors
  }
}

export function NetworkStatsDashboard({
  pnodes,
  refreshInterval = 30000,
  onRefresh,
  trendTimeframe = 5 * 60 * 1000, // Default: 5 minutes
}: NetworkStatsDashboardProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snapshots, setSnapshots] = useState<HistoricalSnapshot[]>(() =>
    safeLoadSnapshots()
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState(trendTimeframe);

  // Calculate base metrics
  const baseMetrics = useMemo(() => {
    const totalNodes = pnodes.length;
    const onlineNodes = pnodes.filter((node) => node.isOnline).length;
    const publicNodes = pnodes.filter((node) => node.is_public).length;

    const avgHealthScore =
      totalNodes > 0
        ? pnodes.reduce((sum, node) => sum + node.healthScore, 0) / totalNodes
        : 0;

    const networkUptime = totalNodes > 0 ? (onlineNodes / totalNodes) * 100 : 0;

    const totalStorageCapacity = pnodes.reduce(
      (sum, node) => sum + node.storage_committed,
      0
    );
    const usedStorage = pnodes.reduce(
      (sum, node) => sum + node.storage_used,
      0
    );
    const storageEfficiency =
      totalStorageCapacity > 0
        ? ((totalStorageCapacity - usedStorage) / totalStorageCapacity) * 100
        : 0;

    return {
      totalNodes,
      onlineNodes,
      publicNodes,
      avgHealthScore,
      networkUptime,
      totalStorageCapacity,
      usedStorage,
      storageEfficiency,
    };
  }, [pnodes]);

  // Pick a comparison snapshot for the selected timeframe.
  // If we don't have a snapshot old enough yet, we consider trends "not ready".
  const comparisonSnapshot = useMemo(() => {
    if (snapshots.length === 0) return null;

    const now = Date.now();
    const cutoffTime = now - selectedTimeframe;

    return (
      snapshots
        .filter((s) => s.timestamp <= cutoffTime)
        .sort((a, b) => b.timestamp - a.timestamp)[0] ?? null
    );
  }, [snapshots, selectedTimeframe]);

  const trendsReady = !!comparisonSnapshot;

  // Calculate trends based on timeframe
  const trends = useMemo(() => {
    if (!comparisonSnapshot) {
      return {
        onlineChange: 0,
        healthChange: 0,
        storageChange: 0,
      };
    }

    return {
      onlineChange: baseMetrics.onlineNodes - comparisonSnapshot.onlineNodes,
      healthChange: Number(
        (
          baseMetrics.avgHealthScore - comparisonSnapshot.avgHealthScore
        ).toFixed(2)
      ),
      storageChange: Number(
        (
          baseMetrics.storageEfficiency - comparisonSnapshot.storageEfficiency
        ).toFixed(2)
      ),
    };
  }, [baseMetrics, comparisonSnapshot]);

  // Final metrics with trends
  const metrics: NetworkMetrics = useMemo(() => {
    return {
      ...baseMetrics,
      trends,
      trendsReady,
    };
  }, [baseMetrics, trends, trendsReady]);

  // Re-load any saved snapshots on mount (in case of hydration timing)
  useEffect(() => {
    setSnapshots((prev) => (prev.length ? prev : safeLoadSnapshots()));
  }, []);

  // Capture snapshots at regular intervals
  useEffect(() => {
    const captureSnapshot = () => {
      const newSnapshot: HistoricalSnapshot = {
        timestamp: Date.now(),
        onlineNodes: baseMetrics.onlineNodes,
        avgHealthScore: baseMetrics.avgHealthScore,
        storageEfficiency: baseMetrics.storageEfficiency,
        totalNodes: baseMetrics.totalNodes,
      };

      setSnapshots((prev) => {
        // Add new snapshot
        const updated = [...prev, newSnapshot];

        // Clean up old snapshots (keep enough for 7d trends; cap at MAX_SNAPSHOT_AGE_MS)
        const cutoff = Date.now() - MAX_SNAPSHOT_AGE_MS;
        const filtered = updated.filter((s) => s.timestamp > cutoff);

        // Persist (best-effort)
        safeSaveSnapshots(filtered);

        console.log("📸 Snapshot captured", {
          total: filtered.length,
          oldest:
            filtered.length > 0
              ? new Date(filtered[0].timestamp).toLocaleTimeString()
              : "none",
          newest: new Date(newSnapshot.timestamp).toLocaleTimeString(),
          onlineNodes: newSnapshot.onlineNodes,
        });

        return filtered;
      });

      setLastUpdated(new Date());
    };

    // Capture initial snapshot
    captureSnapshot();

    // Capture snapshot every 60 seconds (keeps 7d history reasonable)
    const snapshotInterval = setInterval(captureSnapshot, 60000);

    return () => clearInterval(snapshotInterval);
  }, [baseMetrics, selectedTimeframe]);

  // Auto-refresh data
  useEffect(() => {
    if (!refreshInterval || !onRefresh) return;

    const interval = setInterval(() => {
      console.log("🔄 Auto-refresh triggered");
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  const handleManualRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const timeframeOptions = [
    {
      value: 1 * 60 * 1000,
      label: "1 minute",
      description: "Very short-term trends",
    },
    {
      value: 5 * 60 * 1000,
      label: "5 minutes",
      description: "Short-term trends",
    },
    {
      value: 30 * 60 * 1000,
      label: "30 minutes",
      description: "Medium-term trends",
    },
    {
      value: 60 * 60 * 1000,
      label: "1 hour",
      description: "Long-term trends",
    },
    {
      value: 24 * 60 * 60 * 1000,
      label: "24 hours",
      description: "Very long-term trends",
    },
    {
      value: 7 * 24 * 60 * 60 * 1000,
      label: "7 days",
      description: "Historical trends",
    },
  ];

  const formatTimeframe = (ms: number) => {
    const minutes = ms / 60000;
    if (minutes < 60) return `${minutes}m`;
    return `${(minutes / 60).toFixed(1)}h`;
  };

  const comparisonTime = comparisonSnapshot?.timestamp ?? null;

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Network Statistics
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className=" flex items-start justify-start mb-5">
        <TimeframeDropdown
          value={selectedTimeframe}
          onChange={setSelectedTimeframe}
          options={timeframeOptions}
          className="w-[300px]"
        />
      </div>

      {/* Debug Info 
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          🔍 Debug Info
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Total Nodes</div>
            <div className="font-bold text-gray-900 dark:text-white">
              {metrics.totalNodes}
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Online Nodes</div>
            <div className="font-bold text-gray-900 dark:text-white">
              {metrics.onlineNodes}
              <span
                className={`ml-1 ${
                  !trendsReady
                    ? "text-gray-500"
                    : trends.onlineChange > 0
                      ? "text-green-600"
                      : trends.onlineChange < 0
                        ? "text-red-600"
                        : "text-gray-500"
                }`}
              >
                ({trendsReady ? `${trends.onlineChange > 0 ? "+" : ""}${trends.onlineChange}` : "N/A"})
              </span>
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Avg Health</div>
            <div className="font-bold text-gray-900 dark:text-white">
              {metrics.avgHealthScore.toFixed(1)}
              <span
                className={`ml-1 ${
                  !trendsReady
                    ? "text-gray-500"
                    : trends.healthChange > 0
                      ? "text-green-600"
                      : trends.healthChange < 0
                        ? "text-red-600"
                        : "text-gray-500"
                }`}
              >
                ({trendsReady ? `${trends.healthChange > 0 ? "+" : ""}${trends.healthChange}` : "N/A"})
              </span>
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">
              Storage Efficiency
            </div>
            <div className="font-bold text-gray-900 dark:text-white">
              {metrics.storageEfficiency.toFixed(1)}%
              <span
                className={`ml-1 ${
                  !trendsReady
                    ? "text-gray-500"
                    : trends.storageChange > 0
                      ? "text-green-600"
                      : trends.storageChange < 0
                        ? "text-red-600"
                        : "text-gray-500"
                }`}
              >
                ({trendsReady ? `${trends.storageChange > 0 ? "+" : ""}${trends.storageChange}%` : "N/A"})
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800 text-xs text-gray-600 dark:text-gray-400">
          Snapshots: {snapshots.length} | Timeframe:{" "}
          {formatTimeframe(selectedTimeframe)} | Has Comparison Data:{" "}
          {comparisonTime ? "✅" : "⏳"}
        </div>
      </div> */}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <NetworkUptimeCard metrics={metrics} />
        <HealthScoreCard metrics={metrics} />
        <StorageEfficiencyCard metrics={metrics} />
        <PublicAccessCard metrics={metrics} />
      </div>

      {/* Additional Stats Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthDistribution metrics={metrics} pnodes={pnodes} />
        <VersionDistribution pnodes={pnodes} metrics={metrics} />
      </div>
    </div>
  );
}
