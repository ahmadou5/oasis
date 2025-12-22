"use client";

import { ValidatorInfo } from "@/types";
import { formatNumber, formatPercent, formatSOL } from "@/utils/formatters";
import { TrendingUp, Shield, Globe, ExternalLink } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

interface ValidatorCardProps {
  validator: ValidatorInfo;
  onSelect: () => void;
}

export function ValidatorTrendCard({
  validator,
  onSelect,
}: ValidatorCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-solana-green";
      case "delinquent":
        return "text-yellow-400";
      case "inactive":
        return "text-red-400";
      default:
        return "text-solana-gray-400";
    }
  };
  const { theme } = useTheme();

  return (
    <div
      className={`w-[220px] sm:w-[260px] lg:h-[80px] h-[60px] bg-gradient-to-r from-green-400/20 ${
        theme === "dark" ? "to-black/15" : "to-white/5"
      } border border-green-700/50 p-3 flex flex-shrink-0 ${
        theme === "dark" ? "text-white" : "text-black"
      } items-center rounded-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 w-full">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {validator?.avatar ? (
            <Image
              src={validator.avatar}
              alt={validator.name}
              className="w-10 h-10 rounded-full"
              height={40}
              width={40}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {validator?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xs sm:text-sm truncate leading-tight">
            {validator?.name}
          </h3>
          <div className="flex bg-green-600/20 justify-center rounded-full px-2 items-center gap-1 w-[72px] mt-1">
            <span
              className={clsx(
                "inline-block w-1.5 h-1.5 bg-green-600 rounded-full",
                getStatusColor(validator?.status)
              )}
            ></span>
            <p
              className={clsx(
                "text-xs capitalize",
                getStatusColor(validator?.status)
              )}
            >
              {validator?.status}
            </p>
          </div>
        </div>

        {/* APY */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">APY</p>
          <div className="text-sm font-semibold text-solana-green">
            {formatPercent(validator?.apy)}
          </div>
        </div>
      </div>
    </div>
  );
}
