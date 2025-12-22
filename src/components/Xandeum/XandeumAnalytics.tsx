"use client";

import React from "react";
import { XandeumNodeWithMetrics } from "@/types";
import {
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  Activity,
  Shield,
} from "lucide-react";

interface XandeumAnalyticsProps {
  pnodes: XandeumNodeWithMetrics[];
}

export function XandeumAnalytics({ pnodes }: XandeumAnalyticsProps) {
  // Ensure pnodes is an array and provide fallback
  const safeNodes = Array.isArray(pnodes) ? pnodes : [];

  // Calculate network statistics
  const totalNodes = safeNodes.length;
  const onlineNodes = safeNodes.filter((node) => node.isOnline).length;
  const publicNodes = safeNodes.filter((node) => node.is_public).length;
  const totalStorageCommitted = safeNodes.reduce(
    (sum, node) => sum + (node.storage_committed || 0),
    0
  );
  const totalStorageUsed = safeNodes.reduce(
    (sum, node) => sum + (node.storage_used || 0),
    0
  );
  const averageUptime =
    safeNodes.length > 0
      ? safeNodes.reduce((sum, node) => sum + (node.uptime || 0), 0) /
        safeNodes.length
      : 0;
  const averageHealthScore =
    safeNodes.length > 0
      ? safeNodes.reduce((sum, node) => sum + (node.healthScore || 0), 0) /
        safeNodes.length
      : 0;
  const networkEfficiency =
    totalStorageCommitted > 0
      ? ((totalStorageCommitted - totalStorageUsed) / totalStorageCommitted) *
        100
      : 0;

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const stats = [
    {
      title: "Total Nodes",
      value: totalNodes.toString(),
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      description: "Xandeum network nodes",
    },
    {
      title: "Online Nodes",
      value: `${onlineNodes}/${totalNodes}`,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      description: `${((onlineNodes / totalNodes) * 100).toFixed(1)}% uptime`,
    },
    {
      title: "Public Nodes",
      value: publicNodes.toString(),
      icon: Shield,
      color: "from-purple-500 to-violet-500",
      description: `${((publicNodes / totalNodes) * 100).toFixed(
        1
      )}% are public`,
    },
    {
      title: "Storage Capacity",
      value: formatNumber(totalStorageCommitted, 0) + "B",
      icon: DollarSign,
      color: "from-orange-500 to-red-500",
      description: `${formatNumber(totalStorageUsed, 0)}B used`,
    },
    {
      title: "Network Efficiency",
      value: `${networkEfficiency.toFixed(1)}%`,
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      description: "Available storage capacity",
    },
    {
      title: "Health Score",
      value: `${averageHealthScore.toFixed(0)}/100`,
      icon: TrendingUp,
      color: "from-indigo-500 to-purple-500",
      description: `${Math.round(averageUptime / 86400)}d avg uptime`,
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Network Analytics
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real-time insights into the Xandeum parallel node network
            performance and metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {stat.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.description}
                </p>

                {/* Progress indicator for percentage values */}
                {stat.value.includes("%") && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${Math.min(100, parseFloat(stat.value))}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Network Health Indicator */}
        <div className="mt-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Network Health Status
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">
                Optimal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {networkEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Efficiency
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {networkEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Reliability
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {onlineNodes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Nodes
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
