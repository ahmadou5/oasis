"use client";

import React, { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { XandeumNodeWithMetrics } from "@/types";
import {
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  X,
  MapPin,
  Server,
  Activity,
  Clock,
  HardDrive,
} from "lucide-react";

interface PNodeMapProps {
  pnodes: XandeumNodeWithMetrics[];
  className?: string;
}

interface NodeLocation {
  ip: string;
  address: string;
  coordinates: [number, number];
  city: string;
  country: string;
  countryCode: string;
  region: string;
  isOnline: boolean;
  is_public: boolean;
  healthScore: number;
  uptime: number;
  storage_usage_percent: number;
  storage_used: number;
  storage_committed: number;
  version: string;
  pubkey: string;
}

const geoLocationData: Record<
  string,
  {
    coordinates: [number, number];
    city: string;
    country: string;
    countryCode: string;
    region: string;
  }
> = {
  "173.212.204.155": {
    coordinates: [9.491, 51.2993],
    city: "Kassel",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
  },
  "173.249.43.109": {
    coordinates: [13.405, 52.52],
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
  },
  "159.69.208.95": {
    coordinates: [8.6821, 50.1109],
    city: "Frankfurt",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
  },
  "78.46.89.147": {
    coordinates: [7.0982, 50.7374],
    city: "Bonn",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
  },
  "195.201.194.190": {
    coordinates: [9.9937, 53.5511],
    city: "Hamburg",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
  },
  "207.180.203.27": {
    coordinates: [-74.006, 40.7128],
    city: "New York",
    country: "USA",
    countryCode: "US",
    region: "North America",
  },
  "192.168.1.100": {
    coordinates: [-122.4194, 37.7749],
    city: "San Francisco",
    country: "USA",
    countryCode: "US",
    region: "North America",
  },
  "10.0.0.50": {
    coordinates: [-87.6298, 41.8781],
    city: "Chicago",
    country: "USA",
    countryCode: "US",
    region: "North America",
  },
  "185.199.108.153": {
    coordinates: [-0.1276, 51.5074],
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
  },
  "188.166.83.77": {
    coordinates: [4.9041, 52.3676],
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    region: "Europe",
  },
  "139.59.233.165": {
    coordinates: [103.8198, 1.3521],
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    region: "Asia",
  },
  "157.230.41.173": {
    coordinates: [139.6917, 35.6895],
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "Asia",
  },
  "134.195.101.26": {
    coordinates: [-79.3832, 43.6532],
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    region: "North America",
  },
  "128.199.254.193": {
    coordinates: [151.2093, -33.8688],
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    region: "Oceania",
  },
  "51.158.66.56": {
    coordinates: [2.3522, 48.8566],
    city: "Paris",
    country: "France",
    countryCode: "FR",
    region: "Europe",
  },
};

export function PNodeMap({ pnodes, className = "" }: PNodeMapProps) {
  const [selectedNode, setSelectedNode] = useState<NodeLocation | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const GEO_URL =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  function extractIp(address: string): string {
    return address.split(":")[0];
  }

  const nodeLocations = useMemo((): NodeLocation[] => {
    if (!pnodes || pnodes.length === 0) return [];

    return pnodes.map((node) => {
      const ip = extractIp(node.address);

      if (node.location) {
        return {
          ip,
          address: node.address,
          coordinates: node.location.coordinates,
          city: node.location.city || "Unknown",
          country: node.location.country || "Unknown",
          countryCode: node.location.countryCode || "XX",
          region: "Unknown",
          isOnline: node.isOnline,
          is_public: node.is_public,
          healthScore: node.healthScore,
          uptime: node.uptime,
          storage_usage_percent: node.storage_usage_percent,
          storage_used: node.storage_used,
          storage_committed: node.storage_committed,
          version: node.version,
          pubkey: node.pubkey,
        };
      }

      const geoData = geoLocationData[ip];
      if (geoData) {
        return {
          ip,
          address: node.address,
          coordinates: geoData.coordinates,
          city: geoData.city,
          country: geoData.country,
          countryCode: geoData.countryCode,
          region: geoData.region,
          isOnline: node.isOnline,
          is_public: node.is_public,
          healthScore: node.healthScore,
          uptime: node.uptime,
          storage_usage_percent: node.storage_usage_percent,
          storage_used: node.storage_used,
          storage_committed: node.storage_committed,
          version: node.version,
          pubkey: node.pubkey,
        };
      }

      const regions = [
        {
          coordinates: [8.0, 50.0],
          city: "Central Europe",
          country: "Unknown",
          countryCode: "EU",
          region: "Europe",
        },
        {
          coordinates: [-95.0, 40.0],
          city: "North America",
          country: "Unknown",
          countryCode: "NA",
          region: "North America",
        },
        {
          coordinates: [105.0, 15.0],
          city: "Southeast Asia",
          country: "Unknown",
          countryCode: "AS",
          region: "Asia",
        },
      ];
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];

      return {
        ip,
        address: node.address,
        coordinates: [
          randomRegion.coordinates[0] + (Math.random() - 0.5) * 20,
          randomRegion.coordinates[1] + (Math.random() - 0.5) * 10,
        ] as [number, number],
        city: randomRegion.city,
        country: randomRegion.country,
        countryCode: randomRegion.countryCode,
        region: randomRegion.region,
        isOnline: node.isOnline,
        is_public: node.is_public,
        healthScore: node.healthScore,
        uptime: node.uptime,
        storage_usage_percent: node.storage_usage_percent,
        storage_used: node.storage_used,
        storage_committed: node.storage_committed,
        version: node.version,
        pubkey: node.pubkey,
      };
    });
  }, [pnodes]);

  const filteredLocations = useMemo(() => {
    return nodeLocations.filter((location) => {
      if (showOnlineOnly && !location.isOnline) return false;
      if (showPublicOnly && !location.is_public) return false;
      return true;
    });
  }, [nodeLocations, showOnlineOnly, showPublicOnly]);

  // Country statistics
  const countryStats = useMemo(() => {
    const stats = filteredLocations.reduce((acc, location) => {
      const key = location.country;
      if (!acc[key]) {
        acc[key] = { count: 0, countryCode: location.countryCode };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { count: number; countryCode: string }>);

    return Object.entries(stats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5);
  }, [filteredLocations]);

  const totalNodes = filteredLocations.length;

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // solana-green
    if (score >= 60) return "#facc15"; // yellow-400
    if (score >= 40) return "#fb923c"; // orange-400
    return "#f87171"; // red-400
  };

  const formatStorage = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
  };

  if (!pnodes || pnodes.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-2xl ${className}`}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading PNode data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-inherit border border-green-500/50 rounded-2xl overflow-hidden ${className}`}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Map Section */}
        <div className="flex-1 relative">
          {/* Header */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
            <div className="bg-inherit backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border-green-500/30 border">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                PNodes Map
              </h3>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <button
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className={`p-2.5 rounded-xl transition-all backdrop-blur-sm border border-green-500/50 ${
                showOnlineOnly
                  ? "bg-green-500/30 text-white shadow-lg shadow-green-500/30"
                  : "bg-inherit text-white shadow-lg shadow-green-500/5"
              }`}
              title="Online Only"
            >
              {showOnlineOnly ? (
                <Wifi className="w-4 h-4 text-gray-700 dark:text-gray-300 " />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-700 dark:text-gray-300 " />
              )}
            </button>

            <button
              onClick={() => setShowPublicOnly(!showPublicOnly)}
              className={`p-2.5 rounded-xl transition-all backdrop-blur-sm border  border-green-500/50  ${
                showPublicOnly
                  ? "bg-green-500/30 text-white shadow-lg shadow-green-500/30"
                  : "bg-inherit text-white shadow-lg shadow-green-500/5"
              }`}
              title="Public Only"
            >
              {showPublicOnly ? (
                <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300 " />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-700 dark:text-gray-300 " />
              )}
            </button>

            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>

            <button
              onClick={() => setZoom(Math.min(zoom * 1.5, 4))}
              className="p-2.5 rounded-xl bg-inherit text-gray-700 dark:text-gray-300 border border-green-500/50 hover:bg-green-500/20 backdrop-blur-sm transition-all shadow-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => setZoom(Math.max(zoom / 1.5, 0.5))}
              className="p-2.5 rounded-xl bg-inherit text-gray-700 dark:text-gray-300 border border-green-500/50 hover:bg-green-500/20 backdrop-blur-sm transition-all shadow-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setZoom(1);
                setCenter([0, 20]);
              }}
              className="p-2.5 rounded-xl bg-inherit text-gray-700 dark:text-gray-300 border border-green-500/50 hover:bg-green-500/20 backdrop-blur-sm transition-all shadow-lg"
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

                {/* Online gradient - green */}
                <radialGradient
                  id="markerGlow-online"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#16a34a" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulseGlow-online" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                </radialGradient>

                {/* Offline gradient - light red */}
                <radialGradient
                  id="markerGlow-offline"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#f87171" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient
                  id="pulseGlow-offline"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
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

                {/* Node Markers */}
                {filteredLocations.map((location, index) => {
                  const status = location.isOnline ? "online" : "offline";
                  const coreColor = location.isOnline ? "#22c55e" : "#fca5a5";

                  return (
                    <Marker
                      key={`${location.address}-${index}`}
                      coordinates={location.coordinates}
                    >
                      <g
                        className="cursor-pointer"
                        onClick={() => setSelectedNode(location)}
                        onMouseEnter={() =>
                          setHoveredLocation(location.address)
                        }
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        {/* Outer pulse ring (animated) */}
                        <circle
                          r={hoveredLocation === location.address ? 28 : 24}
                          fill={`url(#pulseGlow-${status})`}
                          className="animate-ping"
                          style={{ animationDuration: "3s" }}
                        />

                        {/* Middle glow */}
                        <circle
                          r={18}
                          fill={`url(#markerGlow-${status})`}
                          opacity={
                            hoveredLocation === location.address ? 0.8 : 0.6
                          }
                          className="transition-all duration-300"
                        />

                        {/* Inner core */}
                        <circle
                          r={hoveredLocation === location.address ? 7 : 5}
                          fill={coreColor}
                          className="transition-all duration-300"
                        />

                        {/* White center dot */}
                        <circle
                          r={hoveredLocation === location.address ? 3 : 2}
                          fill="white"
                          className="transition-all duration-300"
                        />
                      </g>
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Region Filter Pills */}
          <div className="absolute bottom-6 left-6 z-10 flex gap-2">
            {["Europe", "Asia", "Africa", "America"].map((region) => (
              <button
                key={region}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-inherit backdrop-blur-sm border border-green-500/50 text-gray-700 dark:text-gray-300 transition-all"
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:w-80 xl:w-96 bg-green-500/5 transition-all duration-300">
          <div className="p-6 space-y-6">
            {/* Total Count */}
            {selectedNode ? (
              <div className="pt-6  space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Node Details
                  </h4>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {selectedNode.city}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {selectedNode.country}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3">
                    {selectedNode.isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex items-center gap-2 flex-1">
                      <span
                        className={`text-sm font-medium ${
                          selectedNode.isOnline
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {selectedNode.isOnline ? "Online" : "Offline"}
                      </span>
                      {selectedNode.is_public && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Health
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {selectedNode.healthScore}/100
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 ml-7">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          selectedNode.healthScore >= 80
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : selectedNode.healthScore >= 60
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-red-500 to-rose-500"
                        }`}
                        style={{ width: `${selectedNode.healthScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <Server className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-gray-900 dark:text-white truncate">
                        {selectedNode.address}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {selectedNode.pubkey.substring(0, 16)}...
                      </div>
                    </div>
                  </div>

                  {/* Uptime */}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {Math.floor(selectedNode.uptime / 86400)}d{" "}
                        {Math.floor((selectedNode.uptime % 86400) / 3600)}h
                        uptime
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        v{selectedNode.version}
                      </div>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="flex items-start gap-3">
                    <HardDrive className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Storage
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {(selectedNode.storage_usage_percent * 100).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatStorage(selectedNode.storage_used)} /{" "}
                        {formatStorage(selectedNode.storage_committed)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    {totalNodes.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Global PNodes Distribution
                  </div>
                </div>

                <div className="space-y-3">
                  {countryStats.map(([country, data]) => {
                    const percentage = (data.count / totalNodes) * 100;
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
                            className="bg-gradient-to-r from-green-500 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
