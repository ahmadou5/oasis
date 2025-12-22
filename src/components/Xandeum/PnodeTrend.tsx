"use client";

import { XandeumNodeWithMetrics } from "@/types";
import { Server } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "../../context/ThemeContext";
import { formatPercent } from "../../utils/formatters";

interface PNodeCardProps {
  pnode: XandeumNodeWithMetrics;
  onSelect: () => void;
}

export function PNodeTrendCard({ pnode, onSelect }: PNodeCardProps) {
  const { theme } = useTheme();

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const nodeDisplayName = pnode?.address?.split(":")[0] || "Unknown Node";

  return (
    <div
      className={`w-[220px] sm:w-[260px] lg:h-[80px] h-[60px] bg-gradient-to-r from-green-400/20 ${
        theme === "dark" ? "to-black/15" : "to-white/5"
      } border border-green-700/50 py-3 px-4 flex flex-shrink-0 ${
        theme === "dark" ? "text-white" : "text-black"
      }  rounded-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col shadow-sm hover:shadow-md`}
      onClick={onSelect}
    >
      <div className=" flex flex-row">
        <div className="flex items-center gap-2 w-full">
          {/* Icon/Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm truncate leading-tight">
              {nodeDisplayName}
            </h3>
            <div
              className={clsx(
                "flex justify-center rounded-full px-2 items-center gap-1 w-[72px] mt-1",
                pnode.isOnline ? "bg-green-600/20" : "bg-red-600/20"
              )}
            >
              <span
                className={clsx(
                  "inline-block w-1.5 h-1.5 rounded-full",
                  pnode.isOnline ? "bg-green-600/90" : "bg-red-600/90"
                )}
              ></span>
              <p
                className={clsx(
                  "text-xs capitalize",
                  pnode.isOnline ? "text-green-600" : "text-red-600"
                )}
              >
                {pnode.isOnline ? "online" : "offline"}
              </p>
            </div>
          </div>

          {/* Health Score */}
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Health</p>
            <div
              className={clsx(
                "text-sm font-semibold",
                getHealthScoreColor(pnode.healthScore)
              )}
            >
              {formatPercent(pnode.healthScore)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex py-2">
        {/* Health Score */}
        <div className="flex flex-row text-end">
          <p className="text-xs ml-2 mr-2 text-gray-500 dark:text-gray-400">
            Available Storage
          </p>
          <div className={clsx("text-xs font-semibold text-green-500/80")}>
            {`${pnode.storageCapacityGB} GB`}
          </div>
        </div>
      </div>
    </div>
  );
}
