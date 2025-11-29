"use client";

import { ValidatorInfo } from "@/store/slices/validatorSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Users,
  DollarSign,
} from "lucide-react";
import { formatPercent, formatSOL } from "@/utils/formatters"; // Assuming formatSOL utility function exists

// --- ⚠️ IMPORTANT: UPDATE THIS INTERFACE IN YOUR validatorSlice.ts ---
// The interface in your actual slice file needs to be updated to include
// the new properties that the API now returns in performanceHistory.
export interface UpdatedValidatorInfo {
  address: string;
  name: string;
  commission: number;
  stake: number;
  apy: number;
  delegatedStake: number;
  skipRate: number;
  dataCenter: string;
  website?: string;
  description?: string;
  avatar?: string;
  status: "active" | "delinquent" | "inactive";
  epochCredits: number[];
  votingPubkey: string;
  activatedStake: number;
  lastVote: number;
  rootSlot: number;
  // Enhanced metadata from Solana Beach
  country?: string;
  keybaseUsername?: string;
  twitterUsername?: string;
  uptime?: number;
  performanceHistory: Array<{
    epoch: number;
    activeStake: number; // NEW
    activeStakeAccounts: number; // NEW
    skipRate: number;
    credits: number;
    apy: number;
  }>;
}
// ------------------------------------------------------------------------

interface ValidatorPerformanceChartProps {
  // Use the new type for correct data access
  validator: UpdatedValidatorInfo;
}

export function ValidatorPerformanceChart({
  validator,
}: ValidatorPerformanceChartProps) {
  const { performanceHistory, uptime } = validator;

  if (!performanceHistory || performanceHistory.length === 0) {
    return (
      <div className="card text-center py-8">
        <Activity className="text-solana-gray-600 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-semibold mb-2">
          Performance Data Unavailable
        </h3>
        <p className="text-solana-gray-400">
          Performance history is not available for this validator.
        </p>
      </div>
    );
  }

  // Prepare chart data (Note: We are adding the new data points here)
  const chartData = performanceHistory
    .map((entry) => ({
      epoch: entry.epoch,
      apy: entry.apy,
      skipRate: entry.skipRate,
      credits: entry.credits,
      activeStake: entry.activeStake / 1_000_000_000, // Convert Lamports to SOL for display
      activeStakeAccounts: entry.activeStakeAccounts,
    }))
    .reverse(); // Show oldest to newest

  // --- NEW: Calculate Performance Metrics including Stake Data ---
  const avgApy =
    performanceHistory.reduce((sum, entry) => sum + entry.apy, 0) /
    performanceHistory.length;
  const avgSkipRate =
    performanceHistory.reduce((sum, entry) => sum + entry.skipRate, 0) /
    performanceHistory.length;
  const avgActiveStake =
    performanceHistory.reduce((sum, entry) => sum + entry.activeStake, 0) /
    performanceHistory.length;
  const avgStakeAccounts =
    performanceHistory.reduce(
      (sum, entry) => sum + entry.activeStakeAccounts,
      0
    ) / performanceHistory.length;

  // Trend calculation remains the same for APY
  const trend =
    performanceHistory.length > 1
      ? performanceHistory[performanceHistory.length - 1].apy -
        performanceHistory[0].apy
      : 0;

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Row 1: Existing Metrics */}
        <div className="card bg-gradient-to-br from-solana-green/20 to-solana-green/10 border-solana-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">Avg APY (30d)</p>
              <p className="text-lg font-bold text-solana-green">
                {formatPercent(avgApy)}
              </p>
            </div>
            <Award className="text-solana-green" size={20} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-solana-blue/20 to-solana-blue/10 border-solana-blue/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">Uptime</p>
              <p className="text-lg font-bold text-solana-blue">
                {uptime ? `${uptime.toFixed(1)}%` : "N/A"}
              </p>
            </div>
            <Activity className="text-solana-blue" size={20} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 border-yellow-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">Avg Skip Rate</p>
              <p className="text-lg font-bold text-yellow-400">
                {formatPercent(avgSkipRate)}
              </p>
            </div>
            <TrendingDown className="text-yellow-400" size={20} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-solana-purple/20 to-solana-purple/10 border-solana-purple/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">
                Performance Trend
              </p>
              <p
                className={`text-lg font-bold ${
                  trend >= 0 ? "text-solana-green" : "text-red-400"
                }`}
              >
                {trend >= 0 ? "+" : ""}
                {formatPercent(trend)}
              </p>
            </div>
            {trend >= 0 ? (
              <TrendingUp className="text-solana-green" size={20} />
            ) : (
              <TrendingDown className="text-red-400" size={20} />
            )}
          </div>
        </div>

        {/* Row 2: NEW Stake Metrics */}
        <div className="card col-span-2 md:col-span-2 bg-gradient-to-br from-indigo-400/20 to-indigo-400/10 border-indigo-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">
                Avg Active Stake (30d)
              </p>
              {/* Note: Active Stake is converted from Lamports to SOL */}
              <p className="text-lg font-bold text-indigo-400">
                {formatSOL(avgActiveStake / 1_000_000_000)}
              </p>
            </div>
            <DollarSign className="text-indigo-400" size={20} />
          </div>
        </div>

        <div className="card col-span-2 md:col-span-2 bg-gradient-to-br from-pink-400/20 to-pink-400/10 border-pink-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">
                Avg Delegators (30d)
              </p>
              <p className="text-lg font-bold text-pink-400">
                {avgStakeAccounts.toFixed(0).toLocaleString()}
              </p>
            </div>
            <Users className="text-pink-400" size={20} />
          </div>
        </div>
      </div>

      {/* APY Chart (Existing) */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          APY Performance (Last 30 Epochs)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="epoch" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => [
                  `${(value as number).toFixed(2)}%`,
                  name === "apy" ? "APY" : name,
                ]}
                labelFormatter={(label) => `Epoch ${label}`}
              />
              <Area
                type="monotone"
                dataKey="apy"
                stroke="#14F195"
                fill="#14F195"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW: Active Stake Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Active Stake History (Last 30 Epochs)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="epoch" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => formatSOL(value as number)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => [
                  formatSOL(value as number),
                  "Active Stake",
                ]}
                labelFormatter={(label) => `Epoch ${label}`}
              />
              <Area
                type="monotone"
                dataKey="activeStake" // Using the new data key
                stroke="#6366F1" // Indigo 500
                fill="#6366F1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <hr className="my-6 border-solana-gray-800" />

      {/* Skip Rate Chart (Existing) */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Skip Rate Performance (Last 30 Epochs)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="epoch" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `${(value * 100).toFixed(1)}%`} // Multiplying by 100 here for better formatting
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => [
                  `${((value as number) * 100).toFixed(2)}%`, // Multiplying by 100 in tooltip
                  "Skip Rate",
                ]}
                labelFormatter={(label) => `Epoch ${label}`}
              />
              <Line
                type="monotone"
                dataKey="skipRate"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 3, fill: "#F59E0B" }}
                activeDot={{ r: 5, fill: "#F59E0B" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Credits Chart (Existing) */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Epoch Credits (Blocks Produced) (Last 30 Epochs)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="epoch" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => [
                  (value as number).toLocaleString(),
                  "Blocks Produced",
                ]}
                labelFormatter={(label) => `Epoch ${label}`}
              />
              <Area
                type="monotone"
                dataKey="credits"
                stroke="#9945FF"
                fill="#9945FF"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
