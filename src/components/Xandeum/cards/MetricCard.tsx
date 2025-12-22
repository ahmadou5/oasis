"use client";

import React from "react";
import {
  LucideIcon,
  MoreVertical,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant: "new" | "beta" | "live";
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  badge,
  className = "",
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const showTrend = change !== undefined && change !== 0;

  const getBadgeStyles = (variant: "new" | "beta" | "live") => {
    switch (variant) {
      case "new":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "beta":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
      case "live":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          {badge && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${getBadgeStyles(
                badge.variant
              )}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Main Value */}
      <div className="mb-3">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>

      {/* Change Indicator */}
      {showTrend && (
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1 ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span className="text-sm font-semibold">
              {isPositive ? "+" : ""}
              {Math.abs(change!).toFixed(1)}%
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {changeLabel}
          </span>
        </div>
      )}

      {/* Icon (bottom right) */}
      {Icon && (
        <div className="flex justify-end mt-2">
          <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
      )}
    </div>
  );
}
