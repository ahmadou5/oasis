"use client";

import React from "react";
import { Globe, MoreVertical } from "lucide-react";
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

interface PublicCardProps {
  metrics: NetworkMetrics;
}
export function PublicAccessCard({ metrics }: PublicCardProps) {
  return (
    <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/50 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Public Nodes
          </h3>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-6">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {((metrics.publicNodes / metrics.totalNodes) * 100).toFixed(0)}%
        </div>
      </div>

      {/* Additional Info */}
      <div className="pt-3 border-t border-gray-200 dark:border-slate-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {metrics.publicNodes} of {metrics.totalNodes} nodes
        </div>
      </div>

      {/* Icon */}
      <div className="flex justify-end mt-2">
        <Globe className="w-5 h-5 text-green-500" />
      </div>
    </div>
  );
}
