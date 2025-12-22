"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Clock,
  Zap,
  Globe,
  Server,
} from "lucide-react";
import { XandeumNodeWithMetrics } from "@/types";

interface NetworkStatsDisplayProps {
  pnodes: XandeumNodeWithMetrics[];
  refreshInterval?: number; // in milliseconds
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
  avgNodeUptime: number;
  healthDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  versionDistribution: Record<string, number>;
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

export function NetworkStatsDisplay({
  pnodes,
  refreshInterval = 30000,
  onRefresh,
}: NetworkStatsDisplayProps) {
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

    const avgNodeUptime =
      totalNodes > 0
        ? pnodes.reduce((sum, node) => sum + node.uptime, 0) / totalNodes
        : 0;

    // Health distribution
    const healthDistribution = {
      excellent: pnodes.filter((node) => node.healthScore >= 80).length,
      good: pnodes.filter(
        (node) => node.healthScore >= 60 && node.healthScore < 80
      ).length,
      fair: pnodes.filter(
        (node) => node.healthScore >= 40 && node.healthScore < 60
      ).length,
      poor: pnodes.filter((node) => node.healthScore < 40).length,
    };

    // Version distribution
    const versionDistribution = pnodes.reduce((acc, node) => {
      const version = node.versionDisplayName || "Unknown";
      acc[version] = (acc[version] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate trends (simplified - in real app, compare with historical data)
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
      avgNodeUptime,
      healthDistribution,
      versionDistribution,
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
      // Keep only last 20 data points
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

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh info */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Network Statistics
        </h2>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Network Uptime */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Network Uptime
              </span>
            </div>
            {getTrendIcon(metrics.trends.onlineChange)}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {metrics.networkUptime.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {metrics.onlineNodes}/{metrics.totalNodes} nodes online
          </div>
          <div
            className={`text-xs mt-1 ${getTrendColor(
              metrics.trends.onlineChange
            )}`}
          >
            {metrics.trends.onlineChange >= 0 ? "+" : ""}
            {metrics.trends.onlineChange} nodes
          </div>
        </div>

        {/* Average Health Score */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Avg Health Score
              </span>
            </div>
            {getTrendIcon(metrics.trends.healthChange)}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {metrics.avgHealthScore.toFixed(0)}/100
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Network health rating
          </div>
          <div
            className={`text-xs mt-1 ${getTrendColor(
              metrics.trends.healthChange
            )}`}
          >
            {metrics.trends.healthChange >= 0 ? "+" : ""}
            {metrics.trends.healthChange.toFixed(1)} points
          </div>
        </div>

        {/* Storage Efficiency */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Storage Efficiency
              </span>
            </div>
            {getTrendIcon(metrics.trends.storageChange)}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {metrics.storageEfficiency.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatBytes(metrics.totalStorageCapacity - metrics.usedStorage)}{" "}
            available
          </div>
          <div
            className={`text-xs mt-1 ${getTrendColor(
              metrics.trends.storageChange
            )}`}
          >
            {metrics.trends.storageChange >= 0 ? "+" : ""}
            {metrics.trends.storageChange.toFixed(1)}% change
          </div>
        </div>

        {/* Public Nodes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Public Access
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {((metrics.publicNodes / metrics.totalNodes) * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {metrics.publicNodes} public nodes
          </div>
        </div>
      </div>

      {/* Health Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Health Score Distribution
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Excellent (80-100)</span>
              </div>
              <span className="font-medium">
                {metrics.healthDistribution.excellent}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Good (60-79)</span>
              </div>
              <span className="font-medium">
                {metrics.healthDistribution.good}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Fair (40-59)</span>
              </div>
              <span className="font-medium">
                {metrics.healthDistribution.fair}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Poor (&lt;40)</span>
              </div>
              <span className="font-medium">
                {metrics.healthDistribution.poor}
              </span>
            </div>
          </div>
        </div>

        {/* Version Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Version Distribution
          </h3>

          <div className="space-y-3 max-h-40 overflow-y-auto">
            {Object.entries(metrics.versionDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([version, count]) => (
                <div
                  key={version}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-mono">{version}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{
                        width: `${(count / metrics.totalNodes) * 80}px`,
                        minWidth: "4px",
                      }}
                    />
                    <span className="font-medium min-w-[2rem] text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Mini trend chart placeholder */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Network Trends (Last {historicalData.length} updates)
        </h3>

        {historicalData.length > 1 ? (
          <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-end justify-center p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              <div>Trend visualization would show:</div>
              <div>
                Online nodes: {historicalData[0]?.onlineNodes} →{" "}
                {historicalData[historicalData.length - 1]?.onlineNodes}
              </div>
              <div>
                Avg health: {historicalData[0]?.avgHealthScore.toFixed(1)} →{" "}
                {historicalData[
                  historicalData.length - 1
                ]?.avgHealthScore.toFixed(1)}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-32 bg-gray-50 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Collecting trend data...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
