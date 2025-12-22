"use client";

import { ValidatorInfo } from "@/types";
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
  ComposedChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Users,
  DollarSign,
  BarChart3,
  Target,
  Zap,
  Shield,
} from "lucide-react";
import { formatPercent, formatSOL } from "@/utils/formatters";
import ValidatorEpochChart from "./ValidatorEpochChart";
import ValidatorEpochStats from "./ValidatorEpochStats";

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
    <div className="space-y-8">
      {/* Modern Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* APY Card 
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Award className="text-emerald-400 w-5 h-5" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  trend >= 0
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {trend >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend >= 0 ? "+" : ""}
                {formatPercent(trend)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Avg APY (30d)
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercent(avgApy)}
              </p>
            </div>
          </div>
        </div> */}

        {/* Uptime Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Shield className="text-blue-400 w-5 h-5" />
              </div>
              <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                {uptime && uptime > 99
                  ? "Excellent"
                  : uptime && uptime > 95
                  ? "Good"
                  : "Needs Attention"}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Network Uptime
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {uptime ? `${uptime.toFixed(1)}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Skip Rate Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Target className="text-amber-400 w-5 h-5" />
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  avgSkipRate < 2
                    ? "bg-emerald-500/20 text-emerald-400"
                    : avgSkipRate < 5
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {avgSkipRate < 2
                  ? "Low"
                  : avgSkipRate < 5
                  ? "Moderate"
                  : "High"}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Avg Skip Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercent(avgSkipRate)}
              </p>
            </div>
          </div>
        </div>

        {/* Delegators Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="text-purple-400 w-5 h-5" />
              </div>
              <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                Active
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Avg Delegators
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgStakeAccounts.toFixed(0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stake Overview */}
      <div className="bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <DollarSign className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Active Stake Overview
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                30-day average performance
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-500">
              {formatSOL(avgActiveStake / 1_000_000_000)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Average Stake
            </p>
          </div>
        </div>
      </div>

      {/* Modern Charts Grid */}
      <div className="grid grid-cols-1 lg:flex gap-6">
        {/* APY Performance Chart
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <TrendingUp className="text-emerald-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  APY Performance
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last 30 epochs tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {chartData.length} Epochs
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="epoch"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  formatter={(value = 7.8, name) => [
                    `${(value as number).toFixed(3)}%`,
                    "APY",
                  ]}
                  labelFormatter={(label) => `Epoch ${label}`}
                  labelStyle={{ color: "#D1D5DB" }}
                />
                <Area
                  type="monotone"
                  dataKey="apy"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#apyGradient)"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Skip Rate Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Target className="text-amber-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Skip Rate Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Lower is better performance
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                avgSkipRate < 2
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : avgSkipRate < 5
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  avgSkipRate < 2
                    ? "bg-emerald-500"
                    : avgSkipRate < 5
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs font-medium">
                {avgSkipRate < 2
                  ? "Excellent"
                  : avgSkipRate < 5
                  ? "Good"
                  : "Needs Attention"}
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="epoch"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  formatter={(value, name) => [
                    `${((value as number) * 100).toFixed(3)}%`,
                    "Skip Rate",
                  ]}
                  labelFormatter={(label) => `Epoch ${label}`}
                  labelStyle={{ color: "#D1D5DB" }}
                />
                <Line
                  type="monotone"
                  dataKey="skipRate"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Stake & Credits Combined Chart */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <BarChart3 className="text-indigo-500 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Active Stake & Block Production
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Combined performance metrics over last 30 epochs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Active Stake
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Block Credits
              </span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
            >
              <defs>
                <linearGradient id="stakeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient
                  id="creditsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis
                dataKey="epoch"
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="stake"
                orientation="left"
                stroke="#6366f1"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatSOL(value as number)}
              />
              <YAxis
                yAxisId="credits"
                orientation="right"
                stroke="#8b5cf6"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                formatter={(value, name) => {
                  if (name === "activeStake") {
                    return [formatSOL(value as number), "Active Stake"];
                  }
                  return [(value as number).toLocaleString(), "Block Credits"];
                }}
                labelFormatter={(label) => `Epoch ${label}`}
                labelStyle={{ color: "#D1D5DB" }}
              />
              <Area
                yAxisId="stake"
                type="monotone"
                dataKey="activeStake"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#stakeGradient)"
              />
              <Bar
                yAxisId="credits"
                dataKey="credits"
                fill="url(#creditsGradient)"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
