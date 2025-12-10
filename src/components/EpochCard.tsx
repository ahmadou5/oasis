"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, TrendingUp, Award, Zap } from "lucide-react";
import { useValidators } from "@/hooks/useValidators";
import { EpochConverter } from "@/lib/epochConverter";
import { Connection, EpochInfo } from "@solana/web3.js";
import { ENV } from "@/config/env";

interface EpochTimeInfo {
  epoch: number;
  absoluteSlot: number;
  slotIndex: number;
  slotsInEpoch: number;
  percentComplete: number;
  estimatedTimeRemaining: string;
  estimatedEndTime: Date;
  humanReadable: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  startTime: Date;
  averageSlotTime: number;
  rewardsDistributed: number;
  validatorsActive: number;
}

export default function EpochCard() {
  //const { epochDetails } = useValidators();
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

    const interval = setInterval(fetchEpochInfo, 100);

    return () => clearInterval(interval);
  }, []);
  const fetchEpochInfo = async () => {
    try {
      // This would use @solana/web3.js in a real implementation
      const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET);
      const epochInfo = await connection.getEpochInfo();
      console.log("Epoch info fetched", epochInfo);
      setEpochData(epochInfo);
      setLoading(false);
      return {
        epoch: epochInfo.epoch,
        slotIndex: epochInfo.slotIndex,
        slotsInEpoch: epochInfo.slotsInEpoch,
        blockHeight: epochInfo.blockHeight,
        absolutrSlot: epochInfo.absoluteSlot, // ~400ms per slot
        transactionCount: epochInfo.transactionCount,
      };
    } catch (error) {
      console.warn("Using fallback epoch info:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!epochInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="text-center text-gray-500">
          Failed to load epoch data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-500/20 rounded-2xl p-6 border border-green-500/50 shadow-lg">
      {/* Header */}

      {/* Progress Ring */}
      <div className="flex items-center justify-between">
        <div className="flex justify-start mb-0">
          <div className="relative w-24 h-24">
            <svg
              className="w-24 h-24 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-100 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#epochGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${
                  2 * Math.PI * 40 * (1 - epochInfo.percentComplete / 100)
                }`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient
                  id="epochGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#16A34A" />
                  <stop offset="100%" stopColor="#16A34C" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-sm font-bold">
                {epochInfo.humanReadable.days === 0
                  ? ""
                  : `${epochInfo.humanReadable.days}d`}
              </div>
              <div className="text-xs text-gray-500">
                {epochInfo.humanReadable.hours}h{" "}
                {epochInfo.humanReadable.minutes}m
              </div>
            </div>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm font-semibold text-green-500">
            {epochInfo.percentComplete.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2 mb-4 mt-4">
        <div className="flex justify-between text-sm">
          <h3 className="text-xl font-bold">Epoch {epochInfo.epoch}</h3>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Estimated End</span>
          <span className="font-medium">
            {epochInfo.estimatedEndTime.toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Remaining</span>
          <span className="font-medium text-green-500/80">
            {epochInfo.estimatedTimeRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}
