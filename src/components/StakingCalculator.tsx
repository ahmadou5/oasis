"use client";

import { useState, useEffect } from "react";

import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  calculateRewards,
  formatSOL,
  formatPercent,
  validateSOLAmount,
} from "@/utils/formatters";
import { Calculator, TrendingUp, Clock, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ValidatorDropdown } from "./ValidatorSelect";
import { useValidators } from "../hooks/useValidators";
import { TimeDropdown } from "./TimeFrameSelect";

interface CalculationResult {
  stakingAmount: number;
  apy: number;
  dailyRewards: number;
  weeklyRewards: number;
  monthlyRewards: number;
  yearlyRewards: number;
  projectedValue: number;
}

export function StakingCalculator() {
  const { validators } = useValidators();
  const { balance, connected } = useWalletBalance();

  const [stakingAmount, setStakingAmount] = useState("");
  const [selectedValidatorAddress, setSelectedValidatorAddress] = useState("");
  const [timeframe, setTimeframe] = useState("1"); // years
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null
  );
  const [error, setError] = useState("");

  const selectedValidator = validators.find(
    (v) => v.address === selectedValidatorAddress
  );
  const topValidators = validators
    .filter((v) => v.status === "active")
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 10);

  useEffect(() => {
    if (topValidators.length > 0 && !selectedValidatorAddress) {
      setSelectedValidatorAddress(topValidators[0].address);
    }
  }, [topValidators, selectedValidatorAddress]);

  useEffect(() => {
    calculateStakingRewards();
  }, [stakingAmount, selectedValidator, timeframe, calculateRewards]);

  const calculateStakingRewards = () => {
    if (!stakingAmount || !selectedValidator) {
      setCalculation(null);
      setError("");
      return;
    }

    const validation = validateSOLAmount(
      stakingAmount,
      connected ? balance : undefined
    );
    if (!validation.isValid) {
      setError(validation.error || "");
      setCalculation(null);
      return;
    }

    setError("");
    const amount = validation.amount!;
    const apy = selectedValidator.apy;

    // Calculate rewards for different timeframes
    const yearlyRewards = (amount * apy) / 100;
    const monthlyRewards = yearlyRewards / 12;
    const weeklyRewards = yearlyRewards / 52;
    const dailyRewards = yearlyRewards / 365;

    const projectedValue = amount + yearlyRewards * parseFloat(timeframe);

    setCalculation({
      stakingAmount: amount,
      apy,
      dailyRewards,
      weeklyRewards,
      monthlyRewards,
      yearlyRewards,
      projectedValue,
    });
  };

  const generateChartData = () => {
    if (!calculation) return [];

    const periods = parseInt(timeframe) * 12; // months
    const monthlyReturn = calculation.monthlyRewards;
    const data = [];

    for (let i = 0; i <= periods; i++) {
      const totalRewards = monthlyReturn * i;
      data.push({
        month: i,
        value: calculation.stakingAmount + totalRewards,
        rewards: totalRewards,
      });
    }

    return data;
  };

  const chartData = generateChartData();

  const handleMaxAmount = () => {
    if (connected && balance > 0) {
      // Keep some SOL for transaction fees
      const maxStake = Math.max(0, balance - 0.01);
      setStakingAmount(maxStake.toString());
    }
  };

  return (
    <div className="space-y-8">
      {/* Calculator Form */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-green-500/10 rounded-xl py-5 px-6 border border-green-400/50 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="text-solana-purple" size={24} />
            <h2 className="text-xl font-bold">Calculate Your Rewards</h2>
          </div>

          {/* Staking Amount */}
          <div>
            <label className="block text-sm font-medium text-solana-gray-300 mb-2">
              Staking Amount (SOL)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Enter amount to stake"
                value={stakingAmount}
                onChange={(e) => setStakingAmount(e.target.value)}
                className="bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 w-48 lg:w-auto transition"
                step="0.001"
                min="0"
              />
              {connected && (
                <button
                  onClick={handleMaxAmount}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium"
                >
                  MAX
                </button>
              )}
            </div>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            {connected && (
              <p className="text-solana-gray-400 text-sm mt-1">
                Available: {formatSOL(balance)}
              </p>
            )}
          </div>

          <ValidatorDropdown
            validators={validators}
            value={selectedValidator}
            onChange={(value) => setSelectedValidatorAddress(value)}
          />

          <TimeDropdown
            validators={[
              {
                id: 1,
                name: "3 Month",
                value: "0.25",
              },
              {
                id: 2,
                name: "6 Month",
                value: "0.5",
              },
              {
                id: 3,
                name: "1 Year",
                value: "1",
              },
              {
                id: 4,
                name: "2 Years",
                value: "2",
              },
              {
                id: 5,
                name: "5 Years",
                value: "5",
              },
            ]}
            value={timeframe}
            onChange={(time) => setTimeframe(time)}
          />

          {/* Info Box */}
          <div className="bg-green-500/10 border border-solana-blue/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-solana-blue mt-0.5" size={16} />
              <div className="text-sm">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="text-solana-gray-400 space-y-1">
                  <li>• Staking rewards are not guaranteed and may vary</li>
                  <li>• There's a warmup period before earning rewards</li>
                  <li>• Unstaking has a cooldown period</li>
                  <li>• Transaction fees apply when staking/unstaking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {calculation ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 py-3 px-5 rounded-xl  border-green-500/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text mb-1">
                      {formatPercent(calculation.apy)}
                    </div>
                    <div className="text-sm text-solana-gray-400">
                      Annual APY
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 py-3 px-5 rounded-xl  border-green-500/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {formatSOL(calculation.projectedValue)}
                    </div>
                    <div className="text-sm text-solana-gray-400">
                      Total Value
                    </div>
                  </div>
                </div>
              </div>

              {/* Rewards Breakdown */}
              <div className="bg-green-500/10 py-3 px-5 rounded-xl  border-green-500/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-solana-green" size={20} />
                  Estimated Rewards
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-solana-gray-800">
                    <span className="text-solana-gray-400">Daily</span>
                    <span className="font-semibold">
                      {formatSOL(calculation.dailyRewards)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-solana-gray-800">
                    <span className="text-solana-gray-400">Weekly</span>
                    <span className="font-semibold">
                      {formatSOL(calculation.weeklyRewards)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-solana-gray-800">
                    <span className="text-solana-gray-400">Monthly</span>
                    <span className="font-semibold">
                      {formatSOL(calculation.monthlyRewards)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-solana-gray-400">Yearly</span>
                    <span className="font-semibold text-solana-green">
                      {formatSOL(calculation.yearlyRewards)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-green-500/10 px-5 rounded-xl  border-green-500/50 text-center py-12">
              <Clock className="text-solana-gray-600 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">
                Enter Details to Calculate
              </h3>
              <p className="text-solana-gray-400">
                Fill in the staking amount and select a validator to see your
                potential rewards.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Growth Chart */}
      {calculation && chartData.length > 0 && (
        <div className="bg-green-500/10 py-3 px-5 rounded-xl  border-green-500/50">
          <h3 className="text-lg font-semibold mb-6">
            Projected Growth Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  label={{
                    value: "Months",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
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
                    name === "value" ? "Total Value" : "Rewards",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#9945FF"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#9945FF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
