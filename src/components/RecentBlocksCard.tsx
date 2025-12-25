"use client";

import React from "react";
import { useRecentBlocks } from "../hooks/useRecentBlocks";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "./Skeleton";
import { useValidators } from "../hooks/useValidators";

interface RecentBlocksCardProps {
  maxBlocks?: number;
  className?: string;
}

export function RecentBlocksCard({
  maxBlocks = 8,
  className = "",
}: RecentBlocksCardProps) {
  const { blocks, loading, error, lastUpdate } = useRecentBlocks(maxBlocks);
  const { validators } = useValidators();

  const formatBlockTime = (blockTime: number | null) => {
    if (!blockTime) return "Unknown";
    try {
      return formatDistanceToNow(new Date(blockTime * 1000), {
        addSuffix: true,
      });
    } catch {
      return "Unknown";
    }
  };

  const formatValidator = (validatorIdentity: string | null) => {
    if (!validatorIdentity) return "Unknown";
    try {
      const foundValidator = validators?.find(
        (v) => v.address === validatorIdentity
      );
      return (
        foundValidator?.name ||
        `${validatorIdentity.slice(0, 6)}...${validatorIdentity.slice(-4)}`
      );
    } catch (error) {}

    return `${validatorIdentity.slice(0, 6)}...${validatorIdentity.slice(-4)}`;
  };

  const formatSlot = (slot: number) => {
    return slot.toLocaleString();
  };

  if (loading && blocks.length === 0) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Skeleton width="w-10" height="h-10" radius="lg" />
          <div className="flex-1">
            <Skeleton width="w-1/3" height="h-5" />
            <div className="mt-2">
              <Skeleton width="w-1/2" height="h-3" radius="sm" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: Math.min(maxBlocks, 6) }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <Skeleton width="w-24" height="h-4" radius="sm" />
                <Skeleton width="w-20" height="h-4" radius="sm" />
              </div>
              <div className="mt-3">
                <Skeleton width="w-2/3" height="h-3" radius="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
            <div className="w-6 h-6 bg-white rounded" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Recent Blocks
            </h3>
            <p className="text-sm text-red-500">Error loading blocks</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Recent Blocks
          </h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                loading ? "bg-yellow-500" : "bg-green-500"
              }`}
            />
            <p className="text-sm text-gray-500">
              {loading
                ? "Updating..."
                : `Updated ${formatDistanceToNow(lastUpdate, {
                    addSuffix: true,
                  })}`}
            </p>
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {blocks.map((block, index) => (
          <div
            key={`${block.slot}-${index}`}
            className={`
              p-4 rounded-lg border transition-all duration-300
              ${
                index === 0
                  ? "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700"
                  : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
              }
              hover:scale-[1.02] hover:shadow-md
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? "bg-green-500 animate-pulse" : "bg-blue-500"
                  }`}
                />
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  Slot {formatSlot(block.slot)}
                </span>
                {index === 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                    Latest
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatBlockTime(block.blockTime)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Validator</p>
                <p className="font-mono text-xs text-gray-900 dark:text-white">
                  {formatValidator(block.validatorVoteAccount)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Transactions</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {block.transactions.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 font-mono truncate">
                {block.blockhash}
              </p>
            </div>
          </div>
        ))}
      </div>

      {blocks.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No recent blocks available
        </div>
      )}

      {/* Stats Footer */}
      {blocks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Latest Slot</p>
              <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                {formatSlot(blocks[0]?.slot || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Transactions</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(
                  blocks.reduce((sum, block) => sum + block.transactions, 0) /
                    blocks.length
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Blocks</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {blocks.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
