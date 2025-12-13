"use client";

import React, { useState, useEffect } from "react";
import { Activity, Zap, DollarSign, BarChart } from "lucide-react";
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
        // Fetch multiple samples for better data
        const performanceSamples = await connection.getRecentPerformanceSamples(
          20
        );
        const fees = await connection.getRecentPrioritizationFees();
        const count = await connection.getTransactionCount();

        if (performanceSamples.length === 0) {
          console.warn("No performance samples available");
          return;
        }

        // Calculate TPS correctly by dividing by sample period
        const currentTPS =
          performanceSamples[0].numTransactions /
          performanceSamples[0].samplePeriodSecs;

        // Average TPS across all samples
        const avgTPS =
          performanceSamples.reduce((sum, sample) => {
            return sum + sample.numTransactions / sample.samplePeriodSecs;
          }, 0) / performanceSamples.length;

        // Peak TPS
        const peakTPS = Math.max(
          ...performanceSamples.map(
            (sample) => sample.numTransactions / sample.samplePeriodSecs
          )
        );

        // TPS history for chart
        const tpsHistory = performanceSamples
          .map((sample) =>
            Math.floor(sample.numTransactions / sample.samplePeriodSecs)
          )
          .reverse(); // Reverse to show oldest to newest

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

    // Initial fetch
    fetchTransactionData();

    // Update every 10 seconds
    const interval = setInterval(fetchTransactionData, 1000);

    return () => clearInterval(interval);
  }, []);

  console.log("data", txData?.currentTPS);

  if (loading) {
    return (
      <div className="bg-green-500/10  rounded-2xl p-6 border border-green-500/50 h-[416px] shadow-lg animate-pulse">
        <div className="h-40 bg-green-500/5 rounded"></div>
      </div>
    );
  }

  if (!txData) {
    return (
      <div className="bg-green-500/10  rounded-2xl p-6 border border-green-500/50 h-[416px] shadow-lg">
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

  const formatValue = (lamports: number) => {
    const sol = lamports / 1e9;
    return `$${formatNumber(sol * 132)}`; // Assuming SOL price ~$132
  };

  return (
    <div className="bg-green-500/10 rounded-2xl py-7 px-8 border border-green-500/50 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div>
          <p className="text-sm text-gray-500">Transactions</p>
        </div>
        <div className="ml-auto text-xs text-gray-400">
          Live • {new Date(txData.lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      {/* Current TPS - Main Metric */}
      <div className="text-center mb-6 p-4 bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-xl border border-green-500/30">
        <div className="text-3xl font-bold text-green-500 mb-1">
          {txData.currentTPS.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500 mb-2">Current TPS</div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <Zap size={14} className="text-yellow-500" />
          <span className="text-gray-600 dark:text-gray-300">
            {((txData.currentTPS / txData.peakTPS) * 100).toFixed(1)}% of peak
          </span>
        </div>
      </div>

      {/* TPS Chart */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">TPS Last 20 Seconds</span>
          <span className="text-xs text-gray-500">
            Peak: {txData.peakTPS.toLocaleString()}
          </span>
        </div>

        <div className="h-16 flex items-end gap-0.5">
          {txData.tpsHistory.map((tps, index) => {
            // Calculate time ago (assuming each bar represents 1 second)
            const secondsAgo = txData.tpsHistory.length - 1 - index;
            const timeLabel = secondsAgo === 0 ? "Now" : `${secondsAgo}s ago`;

            return (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-green-500 to-green-600 rounded-t-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer relative group"
                style={{
                  height: `${Math.max(
                    2,
                    (tps / Math.max(...txData.tpsHistory)) * 100
                  )}%`,
                }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-green-600/70 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="font-semibold">
                    {tps.toLocaleString()} TPS
                  </div>
                  <div className="text-gray-200 text-[10px]">{timeLabel}</div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-green-500"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex items-center justify-center w-auto gap-4 mb-4">
        <div className="text-center p-3 bg-transparent flex justify-between items-center rounded-lg">
          <div className="text-semibold text-gray-500 mb-0 ml-2 mr-2">
            Total Transactions
          </div>
          <div className="font-semibold">
            {txData.totalTransactions.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
