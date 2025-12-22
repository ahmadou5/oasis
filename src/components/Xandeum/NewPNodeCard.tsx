import { useTheme } from "@/context/ThemeContext";
import { XandeumNodeWithMetrics } from "@/types";
import {
  formatStorage,
  formatUptime,
  formatHealthScore,
  formatAddress,
} from "@/utils/formatters";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronUp,
  MapPinIcon,
  ServerIcon,
  Activity,
  Shield,
  Clock,
  HardDrive,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { formatPercent } from "../../utils/formatters";

interface PNodeCardProps {
  pnode: XandeumNodeWithMetrics;
  onSelect?: (pnode: XandeumNodeWithMetrics) => void;
}

export const NewPNodeCard: React.FC<PNodeCardProps> = ({ pnode, onSelect }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [isGridView, setIsGridView] = React.useState<boolean>(false);

  const getStatusColor = (status: boolean) => {
    return status ? "text-solana-green" : "text-red-400";
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-solana-green";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const nodeDisplayName = pnode?.address?.split(":")[0] || "Unknown Node";

  return (
    <div
      className={`flex items-center ${
        isGridView ? "h-auto" : "h-auto"
      } justify-between bg-green-500/5  border-b  border-green-500/50  ${
        theme === "dark" ? "text-white" : "text-black"
      } px-2  py-1`}
    >
      {isGridView ? (
        <div className="flex flex-col w-full h-auto py-4 px-4 gap-4 mobile-safe">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0">
                <ServerIcon className="text-white w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-base truncate"
                  title={nodeDisplayName}
                >
                  {nodeDisplayName}
                </h3>
                <div className="bg-blue-500/20 rounded-full py-1 px-2 inline-flex items-center mt-1">
                  <div
                    className={clsx(
                      "text-xs capitalize flex items-center",
                      getStatusColor(pnode?.isOnline)
                    )}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 flex-shrink-0"></span>
                    <span>{pnode?.isOnline ? "Online" : "Offline"}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-2 border hover:bg-blue-500/10 cursor-pointer border-green-400/30 rounded-xl transition-colors duration-200 flex-shrink-0"
            >
              <X
                size={18}
                className={`${
                  theme === "dark" ? "text-white/80" : "text-black/90"
                }`}
              />
            </button>
          </div>

          {/* Node Details */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="space-y-2 text-sm">
              <p
                className={`${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                <span className="font-medium">Address:</span> {pnode?.address}
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                <span className="font-medium">Public Key:</span>{" "}
                {formatAddress(pnode?.pubkey, 8)}
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                <span className="font-medium">RPC Port:</span> {pnode?.rpc_port}
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                <span className="font-medium">Version:</span>{" "}
                {pnode?.versionDisplayName}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Health Score</div>
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 32 * (1 - (pnode?.healthScore || 0) / 100)
                    }`}
                    className={`transition-all duration-500 ${getHealthScoreColor(
                      pnode?.healthScore
                    )}`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Centered text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-sm font-bold ${getHealthScoreColor(
                      pnode?.healthScore
                    )}`}
                  >
                    {formatPercent(pnode?.healthScore)}
                  </span>
                </div>
              </div>
              <div
                className={`text-sm font-bold ${getHealthScoreColor(
                  pnode?.healthScore
                )}`}
              >
                {formatPercent(pnode?.healthScore)}
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Uptime</div>
              <div className="text-lg font-bold text-blue-500">
                {formatUptime(pnode?.uptime)}
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Storage Used</div>
              <div className="text-lg font-bold">
                {formatStorage(pnode?.storage_used)}
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Storage Capacity</div>
              <div className="text-sm font-bold">
                {formatStorage(pnode?.storage_committed)}
              </div>
              <div className="text-xs text-gray-400">
                {(pnode?.storage_usage_percent * 100).toFixed(1)}% used
              </div>
            </div>
          </div>

          {/* Location */}
          {pnode?.location?.country && (
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <MapPinIcon size={16} className="text-gray-500 flex-shrink-0" />
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                {pnode?.location?.city ? `${pnode.location.city}, ` : ""}
                {pnode?.location?.country}
              </span>
            </div>
          )}

          {/* Action Buttons 
          <div className="flex gap-3 pt-2">
            {onSelect && (
              <button
                onClick={() => {
                  onSelect(pnode);
                  setIsGridView(false);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Connect Node
              </button>
            )}
            <button
              onClick={() => router.push(`/xandeum/${pnode.address}`)}
              className="px-4 py-3 border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 font-medium rounded-xl transition-all duration-200"
            >
              Analytics
            </button>
          </div> */}
        </div>
      ) : (
        <>
          {/* Mobile Layout */}
          <div className="flex flex-col sm:hidden w-full p-4 gap-4 mobile-safe">
            {/* Header Row */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-cyan-500 flex-shrink-0">
                <ServerIcon className="text-white w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-sm truncate"
                  title={nodeDisplayName}
                >
                  {nodeDisplayName}
                </p>

                <div
                  className={clsx(
                    "text-xs capitalize flex items-center",
                    getStatusColor(pnode?.isOnline)
                  )}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-1 flex-shrink-0"></span>
                  <span className="truncate">
                    {pnode?.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className={`text-sm font-semibold ${getHealthScoreColor(
                    pnode?.healthScore
                  )}`}
                >
                  {formatPercent(pnode?.healthScore)}
                </div>
                <div className="text-xs text-gray-500">Health</div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="space-y-1">
                <span className="text-gray-500 block">Uptime:</span>
                <span className="font-semibold text-sm text-blue-500">
                  {formatUptime(pnode?.uptime)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 block">Storage:</span>
                <span className="font-semibold text-sm">
                  {(pnode?.storage_usage_percent * 100).toFixed(1)}%
                </span>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-gray-500 block">Storage Used:</span>
                <div className="space-y-1">
                  <span className="font-semibold text-sm block">
                    {formatStorage(pnode?.storage_used)}
                  </span>
                  <span className="text-xs text-gray-400">
                    of {formatStorage(pnode?.storage_committed)} capacity
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsGridView(!isGridView)}
                className="px-4 py-2.5 border border-green-500/30 text-green-500 hover:bg-blue-500/10 font-medium text-sm rounded-lg transition-all duration-200 flex items-center gap-1"
              >
                <span className="hidden xs:inline">Details</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isGridView ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center w-full">
            <div className="py-2 px-3 flex items-center justify-between w-1/6 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500/30 to-cyan-500 flex-shrink-0">
                  <ServerIcon className="text-white w-6 h-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-light text-sm lg:text-base truncate">
                    {nodeDisplayName}
                  </p>
                  <div className="bg-blue-500/20 rounded-full py-0.5 px-2 inline-flex items-center mt-1">
                    <div
                      className={clsx(
                        "text-xs capitalize",
                        getStatusColor(pnode?.isOnline)
                      )}
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
                      {pnode?.isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`w-1/6 text-xs lg:text-sm font-semibold ${getHealthScoreColor(
                pnode?.healthScore
              )} text-center`}
            >
              {formatPercent(pnode?.healthScore)}
            </div>
            <div className="w-1/6 text-xs lg:text-sm font-medium text-center text-green-500/70">
              {formatUptime(pnode?.uptime)}
            </div>
            <div className="w-1/6 text-xs lg:text-sm font-medium text-center">
              {formatStorage(pnode?.storage_used)}
            </div>
            <div className="w-1/6 text-sm lg:text-base font-semibold text-center">
              {(pnode?.storage_usage_percent * 100).toFixed(1)}%
            </div>
            <div className="w-1/6 flex items-end justify-end">
              <button
                onClick={() => setIsGridView(!isGridView)}
                className="py-2 flex items-center text-xs lg:text-sm px-3 lg:px-6 bg-green-500/70 rounded-xl gap-1"
              >
                View more
                {isGridView ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
