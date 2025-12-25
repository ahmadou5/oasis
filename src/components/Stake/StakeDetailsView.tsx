"use client";

import { useState } from "react";
import { 
  Copy, 
  ExternalLink, 
  Check,
  Shield,
  User,
  TrendingUp,
  Activity,
  Lock,
  Zap,
  Clock,
  DollarSign
} from "lucide-react";
import type { StakeAccountDetails } from "@/lib/solana/stakeDetails";

interface CopyState {
  [key: string]: boolean;
}

function formatSOL(sol?: number): string {
  if (sol === undefined || sol === null) return "-";
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 9 })} SOL`;
}

function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

function truncateAddress(address?: string, start = 4, end = 4): string {
  if (!address) return "-";
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

function formatEpoch(epoch?: number): string {
  if (epoch === undefined || epoch === null) return "-";
  if (epoch === Number.MAX_SAFE_INTEGER || epoch > 1000000) return "Never";
  return epoch.toLocaleString();
}

export function StakeDetailsView({ data }: { data: StakeAccountDetails }) {
  const [activeTab, setActiveTab] = useState<"overview" | "rewards" | "history">("overview");
  const [copyStates, setCopyStates] = useState<CopyState>({});

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates({ ...copyStates, [key]: true });
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CopyButton = ({ text, copyKey, className = "" }: { text: string; copyKey: string; className?: string }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className={`p-1 rounded hover:bg-gray-700/50 transition-colors duration-200 ${className}`}
      title="Copy to clipboard"
    >
      {copyStates[copyKey] ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
      )}
    </button>
  );

  if (!data.found) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold">Stake Account Not Found</div>
          <div className="text-gray-400 mt-2">
            The stake account <span className="font-mono text-sm break-all">{data.address}</span> does not exist on {data.network}.
          </div>
        </div>
      </div>
    );
  }

  const stateColor = {
    uninitialized: "text-gray-400",
    initialized: "text-blue-400",
    delegated: "text-emerald-400",
    inactive: "text-yellow-400",
  }[data.state || "uninitialized"];

  const stateLabel = data.state?.replace(/_/g, " ").toUpperCase() || "UNKNOWN";

  return (
    <div className="space-y-6">
      {/* Stake Overview Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-4">
          {/* Stake Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>

          {/* Stake Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">Stake Account</h2>
              <span className={`px-3 py-1 bg-gray-800 rounded-full text-sm font-medium ${stateColor}`}>
                {stateLabel}
              </span>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <div className="text-gray-400">Balance</div>
                <div className="text-white font-semibold text-lg">
                  {formatSOL(data.balanceSol)}
                </div>
              </div>
              
              {data.delegation && (
                <>
                  <div>
                    <div className="text-gray-400">Delegated Stake</div>
                    <div className="text-emerald-400 font-semibold text-lg">
                      {formatSOL(data.delegation.stakeSol)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Activation Epoch</div>
                    <div className="text-white font-semibold">
                      {formatEpoch(data.delegation.activationEpoch)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Deactivation Epoch</div>
                    <div className="text-white font-semibold">
                      {formatEpoch(data.delegation.deactivationEpoch)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stake Address */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Stake Account Address</div>
              <div className="text-white font-mono text-sm break-all">{data.address}</div>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={data.address} copyKey="address" />
              <a
                href={`https://explorer.solana.com/address/${data.address}?cluster=${data.network}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                title="View on Solana Explorer"
              >
                <ExternalLink className="h-4 w-4 text-gray-400 hover:text-emerald-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Authorities & Delegation */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Authorities Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-white text-lg font-semibold">Authorities</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">Staker</div>
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <span className="text-white font-mono text-sm">
                  {data.staker ? truncateAddress(data.staker, 6, 6) : "-"}
                </span>
                {data.staker && <CopyButton text={data.staker} copyKey="staker" />}
              </div>
            </div>

            <div>
              <div className="text-gray-400 text-sm mb-1">Withdrawer</div>
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <span className="text-white font-mono text-sm">
                  {data.withdrawer ? truncateAddress(data.withdrawer, 6, 6) : "-"}
                </span>
                {data.withdrawer && <CopyButton text={data.withdrawer} copyKey="withdrawer" />}
              </div>
            </div>
          </div>
        </div>

        {/* Validator Info Card */}
        {data.validator && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white text-lg font-semibold">Validator</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Vote Account</div>
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <a
                    href={`/validator/${data.delegation?.voter}`}
                    className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                  >
                    {truncateAddress(data.delegation?.voter, 6, 6)}
                  </a>
                  {data.delegation?.voter && (
                    <CopyButton text={data.delegation.voter} copyKey="voter" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Commission</div>
                  <div className="text-white font-semibold">
                    {data.validator.commission !== undefined 
                      ? `${data.validator.commission}%` 
                      : "-"
                    }
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Status</div>
                  <div className={data.validator.isActive ? "text-emerald-400" : "text-yellow-400"}>
                    {data.validator.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>

              {data.validator.apy !== undefined && (
                <div className="bg-emerald-900/20 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Estimated APY</div>
                  <div className="text-emerald-400 text-xl font-bold">
                    {data.validator.apy.toFixed(2)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lockup Info Card */}
        {data.lockup && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white text-lg font-semibold">Lockup</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-gray-400 text-sm">Lockup Epoch</div>
                <div className="text-white font-semibold">
                  {formatEpoch(data.lockup.epoch)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Custodian</div>
                <div className="text-white font-mono text-sm">
                  {truncateAddress(data.lockup.custodian, 6, 6)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabbed Content */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-700">
          {[
            { id: "overview", label: "Overview", icon: Shield },
            { id: "rewards", label: "Rewards", icon: TrendingUp },
            { id: "history", label: "History", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400 text-sm">Total Balance</span>
                  </div>
                  <div className="text-white text-xl font-bold">
                    {formatSOL(data.balanceSol)}
                  </div>
                </div>

                {data.rentExemptReserve && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm">Rent Reserve</span>
                    </div>
                    <div className="text-white text-xl font-bold">
                      {formatSOL(data.rentExemptReserve / 1e9)}
                    </div>
                  </div>
                )}

                {data.delegation && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className="text-gray-400 text-sm">Active Stake</span>
                    </div>
                    <div className="text-white text-xl font-bold">
                      {formatSOL(data.delegation.stakeSol)}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Delegation Status</h4>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  {data.delegation ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Activation Epoch:</span>
                        <span className="text-white font-mono">
                          {formatEpoch(data.delegation.activationEpoch)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Deactivation Epoch:</span>
                        <span className="text-white font-mono">
                          {formatEpoch(data.delegation.deactivationEpoch)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Warmup/Cooldown Rate:</span>
                        <span className="text-white">
                          {data.delegation.warmupCooldownRate?.toFixed(4) || "-"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      No active delegation
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div>
              <h4 className="text-white font-semibold mb-4">Staking Rewards</h4>
              {(data.rewards ?? []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No rewards data available
                </div>
              ) : (
                <div className="space-y-3">
                  {(data.rewards ?? []).map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div>
                        <div className="text-white font-medium">Epoch {reward.epoch}</div>
                        <div className="text-gray-400 text-sm">
                          Post Balance: {formatSOL(reward.postBalanceSol)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">
                          +{formatSOL(reward.amountSol)}
                        </div>
                        {reward.commission !== undefined && (
                          <div className="text-gray-400 text-sm">
                            {reward.commission}% commission
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h4 className="text-white font-semibold mb-4">Transaction History</h4>
              {(data.recentTransactions ?? []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transaction history available
                </div>
              ) : (
                <div className="space-y-3">
                  {(data.recentTransactions ?? []).map((tx) => (
                    <div
                      key={tx.signature}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <a
                            href={`/tx/${tx.signature}`}
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                          >
                            {truncateAddress(tx.signature, 8, 8)}
                          </a>
                          <div className="text-gray-400 text-xs">
                            {tx.type.toUpperCase()} • Slot {tx.slot.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {tx.amountSol !== undefined && tx.amountSol !== 0 && (
                        <div className={tx.amountSol > 0 ? "text-emerald-400" : "text-red-400"}>
                          {tx.amountSol > 0 ? "+" : ""}{formatSOL(tx.amountSol)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}