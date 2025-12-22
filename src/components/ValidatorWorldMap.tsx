"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { ValidatorInfo } from "@/types";
import { formatSOL, formatPercent } from "@/utils/formatters";
import { useTheme } from "@/context/ThemeContext";
import { useCurrentLeader } from "@/hooks/useCurrentLeader";
import { ENV } from "../config/env";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Server,
  Activity,
  Coins,
  MapPin,
  Users,
  TrendingUp,
} from "lucide-react";

interface ValidatorWorldMapProps {
  validators: ValidatorInfo[];
  selectedValidator?: ValidatorInfo | null;
  onValidatorSelect?: (validator: ValidatorInfo) => void;
  showLabels?: boolean;
  className?: string;
  rpcEndpoint?: string;
  enableLiveLeader?: boolean;
}

export const ValidatorWorldMap: React.FC<ValidatorWorldMapProps> = ({
  validators = [],
  selectedValidator,
  onValidatorSelect,
  showLabels = true,
  className = "",
  rpcEndpoint = ENV.SOLANA.RPC_ENDPOINTS.MAINNET,
  enableLiveLeader = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { publicKey: currentLeaderKey } = useCurrentLeader({
    rpcEndpoint,
    refreshInterval: 2000,
    enabled: enableLiveLeader,
  });

  const [previousLeaderKey, setPreviousLeaderKey] = useState<string | null>(
    null
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const GEO_URL =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  // Find current leader validator
  const currentLeader = useMemo(() => {
    if (!currentLeaderKey) return null;
    return validators.find((v) => v.address === currentLeaderKey);
  }, [currentLeaderKey, validators]);

  // Handle leader transition animation
  useEffect(() => {
    if (currentLeaderKey && currentLeaderKey !== previousLeaderKey) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousLeaderKey(currentLeaderKey);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentLeaderKey, previousLeaderKey]);

  // Process validators with location data
  const validatorsWithLocation = useMemo(() => {
    return validators.filter(
      (validator) =>
        validator.location?.coordinates &&
        validator.location.coordinates.length === 2 &&
        typeof validator.location.coordinates[0] === "number" &&
        typeof validator.location.coordinates[1] === "number"
    );
  }, [validators]);

  // Group validators by location
  const locationGroups = useMemo(() => {
    const groups: { [key: string]: ValidatorInfo[] } = {};

    validatorsWithLocation.forEach((validator) => {
      if (validator.location?.coordinates) {
        const [lng, lat] = validator.location.coordinates;
        const key = `${lat.toFixed(2)}-${lng.toFixed(2)}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(validator);
      }
    });

    return Object.values(groups);
  }, [validatorsWithLocation]);

  // Country statistics
  const countryStats = useMemo(() => {
    const stats = validatorsWithLocation.reduce((acc, validator) => {
      const country = validator.location?.country || "Unknown";
      const countryCode = validator.location?.countryCode || "XX";
      if (!acc[country]) {
        acc[country] = { count: 0, stake: 0, countryCode };
      }
      acc[country].count++;
      acc[country].stake += validator.stake;
      return acc;
    }, {} as Record<string, { count: number; stake: number; countryCode: string }>);

    return Object.entries(stats)
      .sort(([, a], [, b]) => b.stake - a.stake)
      .slice(0, 5);
  }, [validatorsWithLocation]);

  const totalValidators = validatorsWithLocation.length;
  const totalStake = validatorsWithLocation.reduce(
    (sum, v) => sum + v.stake,
    0
  );

  // Get stake-based color for markers
  const getStakeColor = (stake: number) => {
    if (stake >= 1000000) return { gradient: "green", core: "#22c55e" }; // Light green
    if (stake >= 100000) return { gradient: "yellow", core: "#facc15" }; // Light yellow
    return { gradient: "red", core: "#fca5a5" }; // Light red
  };

  const handleMarkerClick = (validators: ValidatorInfo[]) => {
    if (onValidatorSelect && validators.length > 0) {
      const topValidator = validators.reduce((prev, current) =>
        prev.stake > current.stake ? prev : current
      );
      onValidatorSelect(topValidator);
    }
  };

  // Check if a validator group contains the leader
  const groupContainsLeader = (validatorGroup: ValidatorInfo[]) => {
    return validatorGroup.some((v) => v.address === currentLeaderKey);
  };

  return (
    <div
      className={`bg-inherit border border-green-500/50 rounded-2xl overflow-hidden ${className}`}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Map Section */}
        <div className="flex-1 relative">
          {/* Header */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
            <div className="bg-inherit backdrop-blur-sm hidden lg:flex rounded-xl px-4 py-2 shadow-lg border border-green-500/50 items-center gap-3">
              <h3 className="text-xs font-light text-gray-900 dark:text-white">
                Validator Map
              </h3>
            </div>
            {enableLiveLeader && currentLeader && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
                <div>
                  <div className="text-xs font-semibold">LIVE LEADER</div>
                  <div className="text-xs opacity-90">{currentLeader.name}</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.min(zoom * 1.5, 4))}
              className="p-2.5 rounded-xl bg-inherit text-gray-700 dark:text-gray-300 border border-green-500/50 hover:bg-green-500 backdrop-blur-sm transition-all shadow-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom / 1.5, 0.5))}
              className="p-2.5 rounded-xl bg-inherit text-gray-700 dark:text-gray-300 border border-green-500/50 hover:bg-green-500 backdrop-blur-sm transition-all shadow-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setCenter([0, 20]);
              }}
              className="p-2.5 rounded-xl bg-inherit text-gray-700 dark:text-gray-300 border border-green-500/50 hover:bg-green-500 backdrop-blur-sm transition-all shadow-lg"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Map Container */}
          <div className="h-[500px] lg:h-[700px] bg-inherit">
            <ComposableMap
              className="w-full h-full"
              projection="geoMercator"
              projectionConfig={{
                scale: 147,
                center: center,
              }}
            >
              <defs>
                {/* Dotted pattern for continents */}
                <pattern
                  id="dots"
                  x="0"
                  y="0"
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="2"
                    cy="2"
                    r="1"
                    className="fill-green-700 dark:fill-green-500"
                  />
                </pattern>

                {/* Stake-based gradients - Light Green (>= 1M SOL) */}
                <radialGradient id="markerGlow-green" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#16a34a" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulseGlow-green" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                </radialGradient>

                {/* Light Yellow (>= 100K SOL) */}
                <radialGradient
                  id="markerGlow-yellow"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#eab308" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulseGlow-yellow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                </radialGradient>

                {/* Light Red (< 100K SOL) */}
                <radialGradient id="markerGlow-red" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#f87171" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulseGlow-red" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
                </radialGradient>

                {/* Leader gradient - Amber */}
                <radialGradient
                  id="markerGlow-leader"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#d97706" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulseGlow-leader" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
              </defs>

              <ZoomableGroup zoom={zoom} center={center}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="url(#dots)"
                        stroke="none"
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {/* Validator Markers */}
                {locationGroups.map((validatorGroup, index) => {
                  if (!validatorGroup[0]?.location?.coordinates) return null;

                  const coordinates = validatorGroup[0].location.coordinates;
                  const isLeader = groupContainsLeader(validatorGroup);
                  const leaderValidator = isLeader
                    ? validatorGroup.find(
                        (v) =>
                          v.address === currentLeaderKey ||
                          v.voteAccount === currentLeaderKey
                      )
                    : null;

                  // Calculate total stake for the group
                  const totalStake = validatorGroup.reduce(
                    (sum, v) => sum + v.stake,
                    0
                  );
                  const stakeColor = getStakeColor(totalStake);
                  const markerKey = `${coordinates[0]}-${coordinates[1]}`;

                  return (
                    <Marker key={index} coordinates={coordinates}>
                      {!isLeader ? (
                        <g
                          className="cursor-pointer"
                          onClick={() => handleMarkerClick(validatorGroup)}
                          onMouseEnter={() => setHoveredLocation(markerKey)}
                          onMouseLeave={() => setHoveredLocation(null)}
                        >
                          {/* Outer pulse ring */}
                          <circle
                            r={hoveredLocation === markerKey ? 28 : 24}
                            fill={`url(#pulseGlow-${stakeColor.gradient})`}
                            className="animate-ping"
                            style={{ animationDuration: "3s" }}
                          />

                          {/* Middle glow */}
                          <circle
                            r={18}
                            fill={`url(#markerGlow-${stakeColor.gradient})`}
                            opacity={hoveredLocation === markerKey ? 0.8 : 0.6}
                            className="transition-all duration-300"
                          />

                          {/* Inner core */}
                          <circle
                            r={hoveredLocation === markerKey ? 7 : 5}
                            fill={stakeColor.core}
                            className="transition-all duration-300"
                          />

                          {/* White center dot */}
                          <circle
                            r={hoveredLocation === markerKey ? 3 : 2}
                            fill="white"
                            className="transition-all duration-300"
                          />
                        </g>
                      ) : (
                        <g
                          onClick={() => handleMarkerClick(validatorGroup)}
                          style={{ cursor: "pointer" }}
                          className={isTransitioning ? "animate-pulse" : ""}
                        >
                          {/* Outer pulsing ring */}
                          <circle
                            r={32}
                            fill="url(#pulseGlow-leader)"
                            className="animate-ping"
                            style={{ animationDuration: "2s" }}
                          />

                          {/* Middle glow ring */}
                          <circle
                            r={28}
                            fill="url(#markerGlow-leader)"
                            opacity={0.6}
                            className="animate-pulse"
                          />

                          {/* Profile image background circle */}
                          <circle
                            r={24}
                            fill="#fff"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            filter="drop-shadow(0 0 12px rgba(245, 158, 11, 0.8))"
                          />

                          {/* Profile image (clipPath for circular) */}
                          <defs>
                            <clipPath id={`clip-${index}`}>
                              <circle r={21} />
                            </clipPath>
                          </defs>

                          {leaderValidator?.imageUrl ? (
                            <image
                              href={leaderValidator.imageUrl}
                              x={-21}
                              y={-21}
                              width={42}
                              height={42}
                              clipPath={`url(#clip-${index})`}
                              style={{
                                opacity: isTransitioning ? 0.5 : 1,
                                transition: "opacity 0.5s ease-in-out",
                              }}
                            />
                          ) : (
                            <text
                              textAnchor="middle"
                              y={6}
                              fontSize={16}
                              fontWeight="bold"
                              fill="#f59e0b"
                            >
                              {leaderValidator?.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </text>
                          )}

                          {/* Crown icon overlay */}
                          <text
                            x={16}
                            y={-16}
                            fontSize={16}
                            style={{ pointerEvents: "none" }}
                          >
                            👑
                          </text>
                        </g>
                      )}
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Legend */}
          <div className="lg:absolute hidden bottom-6 left-6 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Stake Distribution
            </div>
            <div className="space-y-2">
              {enableLiveLeader && (
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-slate-700">
                  <div className="w-4 h-4 rounded-full bg-amber-500 relative">
                    <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75"></div>
                  </div>
                  <span className="text-xs">Current Leader</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">&gt; 1M SOL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-xs">100K - 1M SOL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-300"></div>
                <span className="text-xs">&lt; 100K SOL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar - Collapsible */}
        <div
          className={`lg:w-80 xl:w-96 bg-green-500/5 transition-all duration-300 ${
            selectedValidator ? "block" : "hidden lg:block"
          }`}
        >
          <div className="p-6 space-y-6">
            {!selectedValidator ? (
              <>
                {/* Total Count */}
                <div>
                  <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    {totalValidators.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Validators
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-green-600 dark:text-green-400">
                    {formatSOL(totalStake)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Total staked
                  </div>
                </div>

                {/* Country Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Top Countries by Stake
                  </h4>
                  {countryStats.map(([country, data]) => {
                    const percentage = (data?.stake / totalStake) * 100;
                    return (
                      <div key={country} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {country}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {data?.count} validators • {formatSOL(data?.stake)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {/* Selected Validator Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Details
                    </h4>
                    <button
                      onClick={() => onValidatorSelect?.(null as any)}
                      className="p-1 rounded-lg text-gray-100 hover:text-green-200 hover:bg-green-500/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Validator Name */}
                  <div className="bg-gradient-to-r from-green-500/20 to-green-700/10 rounded-xl p-4 borderborder-green-500/50">
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {selectedValidator.name}
                    </div>
                    {selectedValidator.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {selectedValidator.location.city},{" "}
                        {selectedValidator.location.country}
                      </div>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Stake
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatSOL(selectedValidator.stake)}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          APY
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPercent(selectedValidator.apy)}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Commission
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedValidator.commission}%
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Score
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedValidator.score || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Identity
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="text-xs font-mono text-gray-900 dark:text-white break-all">
                        {selectedValidator.address}
                      </div>
                    </div>
                  </div>

                  {selectedValidator.voteAccount && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vote Account
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                        <div className="text-xs font-mono text-gray-900 dark:text-white break-all">
                          {selectedValidator.voteAccount}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Website or additional info */}
                  {selectedValidator.website && (
                    <a
                      href={selectedValidator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ValidatorMap = ValidatorWorldMap;
