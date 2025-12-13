"use client";

import { useState } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  X,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { formatAddress, formatSOL } from "../utils/formatters";

// Correct types matching StakeAccountInfo
interface StakeAccount {
  address: { toBase58: () => string };
  balance: number;
  status:
    | "activating"
    | "active"
    | "deactivating"
    | "inactive"
    | "uninitialized"
    | "unknown";
  delegatedValidator?: { toBase58: () => string };
  activationEpoch?: number;
  deactivationEpoch?: number;
  rentExemptReserve: number;
  creditsObserved: number;
  totalBalance: number;
  lastUpdateEpoch: number;
}

interface StakeAccountCardProps {
  stakeAccount: StakeAccount;
  onUnstake?: () => void;
  onViewDetails?: () => void;
}

export const StakeAccountCard = ({
  stakeAccount,
  onUnstake,
  onViewDetails,
}: StakeAccountCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/20",
          text: "Active & Earning",
        };
      case "activating":
        return {
          icon: Clock,
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/20",
          text: "Activating",
        };
      case "deactivating":
        return {
          icon: AlertTriangle,
          color: "text-orange-400",
          bgColor: "bg-orange-400/20",
          text: "Deactivating",
        };
      case "inactive":
        return {
          icon: AlertTriangle,
          color: "text-red-400",
          bgColor: "bg-red-400/20",
          text: "Inactive",
        };
      case "uninitialized":
        return {
          icon: Clock,
          color: "text-gray-400",
          bgColor: "bg-gray-400/20",
          text: "Uninitialized",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-400",
          bgColor: "bg-gray-400/20",
          text: "Unknown",
        };
    }
  };

  const handleViewExplorer = (address: string) => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      const url = `https://solscan.io/account/${address}`;
      window.open(url, "_blank");
    }
  };

  const statusInfo = getStatusInfo(stakeAccount.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={`flex flex-col w-full h-auto border-b transition-all duration-300 ${
        isExpanded
          ? "bg-gradient-to-r from-green-600/10 to-transparent"
          : "bg-gradient-to-r from-green-600/5 to-transparent"
      } ${
        theme === "dark"
          ? "border-green-700/50 text-white"
          : "border-green-300/50 text-black"
      } hover:from-green-600/15 hover:to-transparent`}
    >
      {!isExpanded ? (
        <>
          {/* Mobile Layout */}
          <div className="flex sm:hidden flex-col w-full p-4 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-sm font-mono"
                  title={stakeAccount.address.toBase58()}
                >
                  {formatAddress(stakeAccount.address.toBase58())}
                </p>
                <div
                  className={`text-xs capitalize flex items-center ${statusInfo.color}`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-1 flex-shrink-0"></span>
                  <span className="truncate">{statusInfo.text}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-green-500">
                  {formatSOL(stakeAccount.balance)}
                </div>
                <div className="text-xs text-gray-500">Balance</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-green-500/10 rounded-lg p-3">
              <div>
                <span className="text-xs text-gray-500 block">
                  Total Balance:
                </span>
                <span className="font-semibold text-sm">
                  {formatSOL(stakeAccount.totalBalance)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">
                  Rent Reserve:
                </span>
                <span className="font-semibold text-sm text-green-500">
                  {formatSOL(stakeAccount.rentExemptReserve)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {stakeAccount.status === "active" && (
                <button
                  onClick={onUnstake}
                  className="flex-1 py-2.5 px-4 bg-green-500/80 text-white font-medium text-sm rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Unstake
                </button>
              )}
              <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-2.5 border bg-white border-green-500/50 font-medium text-sm rounded-lg transition-all duration-200 flex items-center gap-1"
              >
                <span>Details</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center w-full py-3 px-4">
            <div className="w-[30%] min-w-0">
              <p
                className="font-medium text-sm font-mono truncate"
                title={stakeAccount.address.toBase58()}
              >
                {stakeAccount.address.toBase58()}
              </p>
              <div
                className={`inline-flex items-center ${statusInfo.bgColor} rounded-full py-0.5 px-2 mt-1`}
              >
                <div
                  className={`text-xs capitalize flex items-center ${statusInfo.color}`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
                  {statusInfo.text}
                </div>
              </div>
            </div>

            <div className="w-[18%] text-center">
              <div className="text-sm lg:text-base font-semibold text-green-500">
                {formatSOL(stakeAccount.balance)}
              </div>
              <div className="text-xs text-gray-500">Balance</div>
            </div>

            <div className="w-[17%] text-center">
              <div className="text-sm font-semibold">
                {formatSOL(stakeAccount.totalBalance)}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>

            <div className="w-[17%] text-center">
              <div className="text-sm font-semibold text-green-500">
                {formatSOL(stakeAccount.rentExemptReserve)}
              </div>
              <div className="text-xs text-gray-500">Rent</div>
            </div>

            <div className="w-[18%] flex items-center justify-end gap-2">
              {stakeAccount.status === "active" && (
                <button
                  onClick={onUnstake}
                  className="py-2 px-3 bg-orange-500/80 hover:bg-orange-500 text-white text-xs rounded-lg transition-all"
                >
                  Unstake
                </button>
              )}
              <button
                onClick={() => setIsExpanded(true)}
                className="py-2 px-3 bg-green-500/70 hover:bg-green-500/90 text-white text-xs rounded-lg flex items-center gap-1 transition-all"
              >
                More
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col w-full h-auto py-4 px-4 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-base font-mono truncate"
                title={stakeAccount.address.toBase58()}
              >
                {stakeAccount.address.toBase58()}
              </h3>
              <div
                className={`inline-flex items-center ${statusInfo.bgColor} rounded-full py-1 px-2 mt-1`}
              >
                <div
                  className={`text-xs capitalize flex items-center ${statusInfo.color}`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 flex-shrink-0"></span>
                  <span>{statusInfo.text}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className={`p-2 border hover:bg-green-500/10 cursor-pointer border-green-400/30 rounded-xl transition-colors duration-200 flex-shrink-0 ${
                theme === "dark" ? "text-white/80" : "text-black/90"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {stakeAccount.delegatedValidator && (
            <div
              className={`${
                theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
              } rounded-lg p-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">
                    Delegated Validator
                  </p>
                  <p className="text-sm font-mono truncate">
                    {stakeAccount.delegatedValidator.toBase58()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleViewExplorer(
                      stakeAccount.delegatedValidator.toBase58()
                    )
                  }
                  className="p-2 hover:bg-green-500/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <ExternalLink size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div
              className={`${
                theme === "dark" ? "bg-gray-800/60" : "bg-white/60"
              } rounded-lg p-3`}
            >
              <div className="text-xs text-gray-500 mb-1">Balance (Staked)</div>
              <div className="text-lg font-bold text-green-500">
                {formatSOL(stakeAccount.balance)}
              </div>
            </div>
            <div
              className={`${
                theme === "dark" ? "bg-gray-800/60" : "bg-white/60"
              } rounded-lg p-3`}
            >
              <div className="text-xs text-gray-500 mb-1">Total Balance</div>
              <div className="text-lg font-bold">
                {formatSOL(stakeAccount.totalBalance)}
              </div>
            </div>
            <div
              className={`${
                theme === "dark" ? "bg-gray-800/60" : "bg-white/60"
              } rounded-lg p-3`}
            >
              <div className="text-xs text-gray-500 mb-1">Rent Reserve</div>
              <div className="text-lg font-bold">
                {formatSOL(stakeAccount.rentExemptReserve)}
              </div>
            </div>
            <div
              className={`${
                theme === "dark" ? "bg-gray-800/60" : "bg-white/60"
              } rounded-lg p-3`}
            >
              <div className="text-xs text-gray-500 mb-1">Credits Observed</div>
              <div className="text-lg font-bold">
                {stakeAccount.creditsObserved.toLocaleString()}
              </div>
            </div>
          </div>

          <div
            className={`${
              theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
            } rounded-lg p-3 space-y-2`}
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Activation Epoch:</span>
              <span className="font-medium">
                {stakeAccount.activationEpoch || "N/A"}
              </span>
            </div>
            {stakeAccount.deactivationEpoch && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deactivation Epoch:</span>
                <span className="font-medium">
                  {stakeAccount.deactivationEpoch}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Update Epoch:</span>
              <span className="font-medium">
                {stakeAccount.lastUpdateEpoch}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {stakeAccount.status === "active" && (
              <button
                onClick={onUnstake}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Unstake
              </button>
            )}
            <button
              onClick={() =>
                handleViewExplorer(stakeAccount.address.toBase58())
              }
              className="flex-1 py-3 px-4 border border-green-500/30 text-green-500 hover:bg-green-500/10 font-medium rounded-xl transition-all duration-200"
            >
              View on Explorer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
