"use client";

import React, { useState, useEffect } from "react";
import { XandeumNodeWithMetrics } from "@/types";
import { Clock, RefreshCw } from "lucide-react";
import NetworkUptimeCard from "./NetworkUptimeCard";
import { HealthScoreCard } from "./HealthScoreCard";
import { StorageEfficiencyCard } from "./StorageCard";
import { PublicAccessCard } from "./PublicCard";
import { HealthDistribution } from "./HealthDistribution";
import { VersionDistribution } from "./VersionDistribution";

interface NetworkStatsDashboardProps {
  pnodes: XandeumNodeWithMetrics[];
  refreshInterval?: number;
  onRefresh?: () => void;
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
}

interface HistoricalData {
  timestamp: number;
  onlineNodes: number;
  avgHealthScore: number;
  storageEfficiency: number;
}

export function NetworkStatsDashboard({
  pnodes,
  refreshInterval = 30000,
  onRefresh,
}: NetworkStatsDashboardProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  // Calculate current network metrics
  const calculateMetrics = (): NetworkMetrics => {
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

    // Calculate trends
    const trends = {
      onlineChange:
        historicalData.length > 0
          ? onlineNodes - historicalData[historicalData.length - 1].onlineNodes
          : 0,
      healthChange:
        historicalData.length > 0
          ? avgHealthScore -
            historicalData[historicalData.length - 1].avgHealthScore
          : 0,
      storageChange:
        historicalData.length > 0
          ? storageEfficiency -
            historicalData[historicalData.length - 1].storageEfficiency
          : 0,
    };

    return {
      totalNodes,
      onlineNodes,
      publicNodes,
      avgHealthScore,
      networkUptime,
      totalStorageCapacity,
      usedStorage,
      storageEfficiency,
      trends,
    };
  };

  const metrics = calculateMetrics();

  // Update historical data
  useEffect(() => {
    const newDataPoint: HistoricalData = {
      timestamp: Date.now(),
      onlineNodes: metrics.onlineNodes,
      avgHealthScore: metrics.avgHealthScore,
      storageEfficiency: metrics.storageEfficiency,
    };

    setHistoricalData((prev) => {
      const updated = [...prev, newDataPoint];
      return updated.slice(-20);
    });

    setLastUpdated(new Date());
  }, [pnodes]);

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval || !onRefresh) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`;
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Network Statistics
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={() => {
              setIsRefreshing(true);
              onRefresh?.();
              setTimeout(() => setIsRefreshing(false), 1000);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Network Uptime Card */}
        <NetworkUptimeCard metrics={metrics} />
        <HealthScoreCard metrics={metrics} />

        <StorageEfficiencyCard metrics={metrics} />
        <PublicAccessCard metrics={metrics} />
      </div>

      {/* Additional Stats Section (Optional) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthDistribution metrics={metrics} pnodes={pnodes} />
        {/* Health Distribution */}
        <VersionDistribution pnodes={pnodes} metrics={metrics} />
        {/* Version Distribution */}
      </div>
    </div>
  );
}
