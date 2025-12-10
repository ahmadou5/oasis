"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Crown, Clock, Users, Globe } from "lucide-react";

import { useValidators } from "../hooks/useValidators";

interface ValidatorLocation extends ValidatorInfo {
  latitude?: number;
  longitude?: number;
  city?: string;
  isCurrentLeader: boolean;
  isNextLeader: boolean;
}

interface LeaderSchedule {
  currentLeader: ValidatorLocation | null;
  nextLeaders: ValidatorLocation[];
  slotTime: number;
  currentSlot: number;
  leaderChangeTime: string;
}

export default function ValidatorWorldMap() {
  const { validators: rawValidators, loading, error } = useValidators();
  const [selectedValidator, setSelectedValidator] =
    useState<ValidatorLocation | null>(null);
  const [currentSlot, setCurrentSlot] = useState(0);

  useEffect(() => {
    // Update slot counter every 400ms to simulate real-time
    const interval = setInterval(() => {
      setCurrentSlot((prev) => prev + 1);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-green"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Loading validator data...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-red-200 dark:border-red-700 shadow-lg">
        <div className="text-center text-red-600 dark:text-red-400">
          <h3 className="font-semibold mb-2">Error Loading Validator Data</h3>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatStake = (stake: number) => {
    return (stake / 1000000).toFixed(1) + "M SOL";
  };

  const getValidatorPin = (validator: ValidatorLocation) => {
    // Convert lat/lng to SVG coordinates (simplified projection)
    const longitude = validator.longitude || 0;
    const latitude = validator.latitude || 0;
    const x = ((longitude + 180) / 360) * 800;
    const y = ((90 - latitude) / 180) * 400;

    return { x, y };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-solana-green to-emerald-400 rounded-lg">
            <Globe size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Global Validator Map</h3>
            <p className="text-sm text-gray-500">Real-time leader schedule</p>
          </div>
        </div>
        <div className="text-right"></div>
      </div>

      {/* World Map SVG */}
      <div className="relative mb-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden">
        <svg viewBox="0 0 800 400" className="w-full h-64">
          {/* Simplified world map background */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#grid)" />

          {/* Simplified continents */}
          <path
            d="M100 100 Q200 80 300 100 Q400 120 500 100 L500 200 Q400 220 300 200 Q200 180 100 200 Z"
            fill="#e5e7eb"
            opacity="0.3"
          />
          <path
            d="M150 250 Q250 230 350 250 Q450 270 550 250 L550 350 Q450 370 350 350 Q250 330 150 350 Z"
            fill="#e5e7eb"
            opacity="0.3"
          />
          <path
            d="M600 120 Q700 100 750 120 L750 220 Q700 240 600 220 Z"
            fill="#e5e7eb"
            opacity="0.3"
          />

          {/* Validator Pins */}
          {rawValidators.map((validator, index) => {
            const { x, y } = getValidatorPin(validator);
            return (
              <g key={validator.address}>
                {/* Pulse animation for current leader */}
                {validator.isCurrentLeader && (
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill="none"
                    stroke="#14F195"
                    strokeWidth="2"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="r"
                      values="10;25;10"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Pin */}
                <circle
                  cx={x}
                  cy={y}
                  r={
                    validator.isCurrentLeader
                      ? "8"
                      : validator.isNextLeader
                      ? "6"
                      : "4"
                  }
                  fill={
                    validator.isCurrentLeader
                      ? "#FFD700"
                      : validator.isNextLeader
                      ? "#14F195"
                      : "#6B7280"
                  }
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setSelectedValidator(validator)}
                />

                {/* Leader Crown */}
                {validator.isCurrentLeader && (
                  <text
                    x={x}
                    y={y - 15}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#FFD700"
                  >
                    👑
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
      </div>

      {/* Next Leaders Queue */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-solana-green" />
          <span className="font-semibold">Upcoming Leaders</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
      </div>
    </div>
  );
}
