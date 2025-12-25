"use client";

import React from "react";
import { Timer } from "lucide-react";

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
  trendsReady: boolean;
}

interface NetworkUptimeCardProps {
  metrics: NetworkMetrics;
  className?: string;
}

export function NetworkUptimeCard({
  metrics,
  className = "",
}: NetworkUptimeCardProps) {
  const showTrend = metrics.trendsReady;

  return (
    <div
      className={`bg-green-500/5 rounded-2xl p-6 border border-green-500/50  shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Network Uptime
          </h3>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-3">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {metrics.networkUptime.toFixed(1)}%
        </div>
      </div>

      {/* Change Indicator */}
      <div className="flex items-center w-auto  gap-2 mb-4">
        <div className="bg-green-500/10 rounded-xl py-1 px-4">
          <div
            className={`inline-flex items-center gap-1 ${
              !showTrend
                ? "text-gray-500"
                : metrics.trends.onlineChange >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            <span className="text-sm font-semibold">
              {showTrend
                ? `${metrics.trends.onlineChange >= 0 ? "+" : ""}${metrics.trends.onlineChange} nodes`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="pt-3 border-t border-gray-200 dark:border-slate-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {metrics.onlineNodes}/{metrics.totalNodes} nodes online
        </div>
      </div>

      {/* Icon */}
      <div className="flex justify-end mt-2">
        <Timer className="w-5 h-5 text-green-500" />
      </div>
    </div>
  );
}

export default NetworkUptimeCard;
