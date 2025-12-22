"use client";

import React, { useState, useEffect } from "react";
import { MoreVertical, TrendingUp, Activity, Eye } from "lucide-react";
import { Connection } from "@solana/web3.js";
import { ENV } from "../config/env";

interface TransactionData {
  totalTransactions: number;
  currentTPS: number;
  averageTPS: number;
  peakTPS: number;
  totalValue: number;
  averageFee: number;
  successRate: number;
  lastUpdated: string;
  tpsHistory: number[];
}

export default function TransactionsCard() {
  const [txData, setTxData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET);

    const fetchTransactionData = async () => {
      try {
        const performanceSamples = await connection.getRecentPerformanceSamples(
          20
        );
        const fees = await connection.getRecentPrioritizationFees();
        const count = await connection.getTransactionCount();

        if (performanceSamples.length === 0) {
          console.warn("No performance samples available");
          return;
        }

        const currentTPS =
          performanceSamples[0].numTransactions /
          performanceSamples[0].samplePeriodSecs;

        const avgTPS =
          performanceSamples.reduce((sum, sample) => {
            return sum + sample.numTransactions / sample.samplePeriodSecs;
          }, 0) / performanceSamples.length;

        const peakTPS = Math.max(
          ...performanceSamples.map(
            (sample) => sample.numTransactions / sample.samplePeriodSecs
          )
        );

        const tpsHistory = performanceSamples
          .map((sample) =>
            Math.floor(sample.numTransactions / sample.samplePeriodSecs)
          )
          .reverse();

        const txData: TransactionData = {
          totalTransactions: count,
          currentTPS: Math.floor(currentTPS),
          averageTPS: Math.floor(avgTPS),
          peakTPS: Math.floor(peakTPS),
          totalValue: 1847329847329 + Math.floor(Math.random() * 1000000000),
          averageFee: fees[0]?.prioritizationFee || 0,
          successRate: 98.7,
          lastUpdated: new Date().toISOString(),
          tpsHistory: tpsHistory,
        };

        setTxData(txData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
        setLoading(false);
      }
    };

    fetchTransactionData();
    const interval = setInterval(fetchTransactionData, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-green-500/5 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm animate-pulse">
        <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (!txData) {
    return (
      <div className="bg-green-500/5 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="text-center text-gray-500">
          Failed to load transaction data
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Calculate percentage change (simulated)
  const tpsChange =
    ((txData.currentTPS - txData.averageTPS) / txData.averageTPS) * 100;
  const isPositive = tpsChange >= 0;

  return (
    <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/50 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Transactions
          </h3>
        </div>
      </div>

      {/* Current TPS */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {txData.currentTPS.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{`TPU(Transactions Per Second)`}</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
              isPositive
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-red-500/10 text-red-700 dark:text-red-400"
            }`}
          >
            <span className="text-sm font-semibold">
              {isPositive ? "+" : "-"}
              {Math.abs(tpsChange).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* TPS Chart */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            TPS Over Time
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Peak: {txData.peakTPS.toLocaleString()}
          </span>
        </div>

        <div className="h-20 flex items-end gap-1">
          {txData.tpsHistory.map((tps, index) => {
            const maxTPS = Math.max(...txData.tpsHistory);
            const height = Math.max(10, (tps / maxTPS) * 100);
            const isRecent = index >= txData.tpsHistory.length - 3;

            return (
              <div
                key={index}
                className="flex-1 group relative"
                style={{ height: "100%" }}
              >
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isRecent
                      ? "bg-gradient-to-t from-green-500 to-green-400"
                      : "bg-gradient-to-t from-green-200 to-green-300"
                  } hover:from-green-700 hover:to-green-600 cursor-pointer`}
                  style={{
                    height: `${height}%`,
                    marginTop: `${100 - height}%`,
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-gray-700">
                    <div className="font-semibold">
                      {tps.toLocaleString()} TPS
                    </div>
                    <div className="text-gray-300 text-[10px]">
                      {txData.tpsHistory.length - 1 - index}s ago
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-800">
        <div className="ml-2 mr-auto">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Total Transactions
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatNumber(txData.totalTransactions)}
          </div>
        </div>
        <div className="ml-auto mr-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Avg TPS
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {txData.averageTPS.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
