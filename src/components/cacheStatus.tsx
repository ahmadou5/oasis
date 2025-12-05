"use client";

import React from "react";

interface CacheStatusProps {
  isFromCache: boolean;
  cacheInfo: {
    exists: boolean;
    isValid: boolean;
    ageMinutes: number | null;
    expiresInMinutes: number | null;
  };
  lastUpdated: number | null;
  onRefresh: () => void;
  onClearCache: () => void;
  loading: boolean;
}

export function CacheStatus({
  isFromCache,
  cacheInfo,
  lastUpdated,
  onRefresh,
  onClearCache,
  loading,
}: CacheStatusProps) {
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString();
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Cache Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isFromCache
                  ? "bg-blue-500"
                  : loading
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-green-500"
              }`}
            />
            <span className="text-sm font-medium text-gray-700">
              {isFromCache
                ? "📦 Cached Data"
                : loading
                ? "⏳ Loading..."
                : "✅ Fresh Data"}
            </span>
          </div>

          {/* Last Updated */}
          <div className="text-sm text-gray-600">
            Last updated: {formatLastUpdated()}
          </div>

          {/* Cache Age */}
          {cacheInfo.exists && cacheInfo.ageMinutes !== null && (
            <div className="text-sm text-gray-600">
              {isFromCache && (
                <span>
                  Cache age: {cacheInfo.ageMinutes}m
                  {cacheInfo.expiresInMinutes !== null &&
                    ` (expires in ${cacheInfo.expiresInMinutes}m)`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>

          {cacheInfo.exists && (
            <button
              onClick={onClearCache}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              🗑️ Clear Cache
            </button>
          )}
        </div>
      </div>

      {/* Info Message */}
      {isFromCache && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 rounded p-2">
          ℹ️ You're viewing cached data to reduce API calls and avoid rate
          limits. Click "Refresh" to get the latest data.
        </div>
      )}
    </div>
  );
}
