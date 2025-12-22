import { useTheme } from "@/context/ThemeContext";
import { ValidatorInfo } from "@/types";
import { formatPercent, formatSOL } from "@/utils/formatters";
import clsx from "clsx";
import {
  ArrowDown,
  ChevronDown,
  ChevronUp,
  LocateIcon,
  LucideGlobe2,
  MapPinIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React from "react";

interface ValidatorCardProps {
  validator: ValidatorInfo;
  onSelect: (validator: ValidatorInfo) => void;
}

export const NewValidatorCard: React.FC<ValidatorCardProps> = ({
  validator,
  onSelect,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [isGridView, setIsGridView] = React.useState<boolean>(false);
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
  return (
    <div
      //onClick={() => setIsGridView(!isGridView)}
      className={`flex items-center ${
        isGridView ? "h-auto" : "h-auto"
      } justify-between bg-green-500/5 border-b  border-green-700/50  ${
        theme === "dark" ? "text-white" : "text-black"
      } px-2  py-1`}
    >
      {isGridView ? (
        <div className="flex flex-col w-full h-auto py-4 px-4 gap-4 mobile-safe">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {validator?.avatar ? (
                <Image
                  src={validator.avatar}
                  alt={validator.name}
                  className="w-14 h-14 rounded-full bg-solana-gray-800 flex-shrink-0"
                  height={14}
                  width={14}
                />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-solana-purple to-solana-green flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {validator?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-base truncate"
                  title={validator?.name}
                >
                  {validator?.name}
                </h3>
                <div className="bg-green-500/20 rounded-full py-1 px-2 inline-flex items-center mt-1">
                  <div
                    className={clsx(
                      "text-xs capitalize flex items-center",
                      getStatusColor(validator?.status)
                    )}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 flex-shrink-0"></span>
                    <span>{validator?.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-2 border hover:bg-green-500/10 cursor-pointer border-green-400/30 rounded-xl transition-colors duration-200 flex-shrink-0"
            >
              <X
                size={18}
                className={`${
                  theme === "dark" ? "text-white/80" : "text-black/90"
                }`}
              />
            </button>
          </div>
          {/* Description */}
          {validator?.description && (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <p
                className={`text-sm leading-relaxed ${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                {validator?.description}
              </p>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">APY</div>
              <div className="text-lg font-bold text-solana-green">
                {formatPercent(validator?.apy)}
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Commission</div>
              <div className="text-lg font-bold">
                {formatPercent(validator?.commission)}
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Skip Rate</div>
              <div className="text-lg font-bold">
                {formatPercent(validator?.skipRate)}
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Total Stake</div>
              <div className="text-sm font-bold">
                {formatSOL(validator?.stake)}
              </div>
              <div className="text-xs text-gray-400">
                ≈ ${(validator?.stake * 132).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Location */}
          {validator?.country && (
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <MapPinIcon size={16} className="text-gray-500 flex-shrink-0" />
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                {validator?.country}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                onSelect(validator);
                setIsGridView(false);
              }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-solana-green to-emerald-400 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Delegate SOL
            </button>
            <button
              onClick={() => router.push(`/validator/${validator.address}`)}
              className="px-4 py-3 border border-solana-green/30 text-solana-green hover:bg-solana-green/10 font-medium rounded-xl transition-all duration-200"
            >
              Analytics
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Layout */}
          <div className="flex flex-col sm:hidden w-full p-4 gap-4 mobile-safe">
            {/* Header Row */}
            <div className="flex items-center gap-3 min-w-0">
              {validator?.avatar ? (
                <Image
                  src={validator.avatar}
                  alt={validator.name}
                  className="w-12 h-12 rounded-full bg-solana-gray-800 flex-shrink-0"
                  height={12}
                  width={12}
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-solana-purple to-solana-green flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {validator?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-sm truncate"
                  title={validator?.name}
                >
                  {validator?.name}
                </p>

                <div
                  className={clsx(
                    "text-xs capitalize flex items-center",
                    getStatusColor(validator?.status)
                  )}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-1 flex-shrink-0"></span>
                  <span className="truncate">{validator?.status}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-solana-green">
                  {formatPercent(validator?.apy)}
                </div>
                <div className="text-xs text-gray-500">APY</div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="space-y-1">
                <span className="text-gray-500 block">Commission:</span>
                <span className="font-semibold text-sm">
                  {formatPercent(validator?.commission)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 block">Skip Rate:</span>
                <span className="font-semibold text-sm">
                  {formatPercent(validator?.skipRate)}
                </span>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-gray-500 block">Total Stake:</span>
                <div className="space-y-1">
                  <span className="font-semibold text-sm block">
                    {formatSOL(validator?.stake)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ≈ ${(validator?.stake * 132).toLocaleString()} USDC
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onSelect(validator);
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-solana-green to-emerald-400 text-white font-medium text-sm rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Delegate SOL
              </button>
              <button
                onClick={() => setIsGridView(!isGridView)}
                className="px-4 py-2.5 border border-solana-green/30 text-solana-green hover:bg-solana-green/10 font-medium text-sm rounded-lg transition-all duration-200 flex items-center gap-1"
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
                {validator?.avatar ? (
                  <Image
                    src={validator.avatar}
                    alt={validator.name}
                    className="w-12 h-12 rounded-full bg-solana-gray-800 flex-shrink-0"
                    height={12}
                    width={12}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-solana-purple to-solana-green flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {validator?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-light text-sm lg:text-base truncate">
                    {validator?.name}
                  </p>
                  <div className="bg-green-500/20 rounded-full py-0.5 px-2 inline-flex items-center mt-1">
                    <div
                      className={clsx(
                        "text-xs capitalize",
                        getStatusColor(validator?.status)
                      )}
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
                      {validator?.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/6 text-sm lg:text-base font-semibold text-solana-green/60 text-center">
              {formatPercent(validator?.apy)}
            </div>
            <div className="w-1/6 text-xs lg:text-sm font-medium text-center">
              {formatPercent(validator?.commission)}
            </div>
            <div className="w-1/6 text-xs lg:text-sm font-medium text-center">
              {formatSOL(validator?.stake)}
            </div>
            <div className="w-1/6 text-sm lg:text-base font-semibold text-solana-green/60 text-center">
              {formatPercent(validator?.skipRate)}
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
