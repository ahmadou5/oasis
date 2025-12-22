"use client";

import React, { useState, useEffect } from "react";
import { MoreVertical, TrendingUp } from "lucide-react";
import { Connection, EpochInfo } from "@solana/web3.js";
import { EpochConverter } from "../lib/epochConverter";
import { ENV } from "../config/env";

export default function EpochCard() {
  const [epochData, setEpochData] = useState<EpochInfo>();
  const [loading, setLoading] = useState(true);

  const epochInfo = EpochConverter.convertEpochToTime({
    epoch: epochData?.epoch || 0,
    slotIndex: epochData?.slotIndex || 0,
    slotsInEpoch: epochData?.slotsInEpoch || 0,
    absoluteSlot: epochData?.absoluteSlot || 0,
  });

  useEffect(() => {
    fetchEpochInfo();
    const interval = setInterval(fetchEpochInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchEpochInfo = async () => {
    try {
      const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET);
      const epochInfo = await connection.getEpochInfo();
      setEpochData(epochInfo);
      setLoading(false);
    } catch (error) {
      console.warn("Using fallback epoch info:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500 shadow-sm animate-pulse">
        <div className="h-40 bg-gray-100/15 dark:bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (!epochInfo) {
    return (
      <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500 shadow-sm">
        <div className="text-center text-gray-500">
          Failed to load epoch data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/50 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Epoch
          </h3>
        </div>
      </div>

      {/* Epoch Number & Progress */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {epochInfo.epoch}
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              <span className="text-sm font-semibold">
                {epochInfo.percentComplete.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              complete
            </span>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-gray-100 dark:text-slate-800"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${
                2 * Math.PI * 40 * (1 - epochInfo.percentComplete / 100)
              }`}
              className="text-green-500 transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {epochInfo.humanReadable.days > 0 &&
                `${epochInfo.humanReadable.days}d`}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {epochInfo.humanReadable.hours}h {epochInfo.humanReadable.minutes}
              m
            </div>
          </div>
        </div>
      </div>

      {/* Time Info */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Estimated End
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {epochInfo.estimatedEndTime.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Time Remaining
          </span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {epochInfo.estimatedTimeRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}
