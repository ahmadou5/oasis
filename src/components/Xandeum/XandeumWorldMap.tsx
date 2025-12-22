'use client';

import React, { useEffect, useRef, useState } from 'react';
import { XandeumNodeWithMetrics } from '@/types';
import { 
  MapPin, 
  Globe, 
  Wifi, 
  WifiOff, 
  Activity,
  Server,
  Eye,
  EyeOff
} from 'lucide-react';

interface XandeumWorldMapProps {
  pnodes: XandeumNodeWithMetrics[];
}

interface NodeLocation {
  ip: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  isOnline: boolean;
  is_public: boolean;
  healthScore: number;
  uptime: number;
}

// Mock geolocation data (in a real app, you'd call a geolocation API)
const mockGeoData: Record<string, { lat: number; lng: number; city: string; country: string }> = {
  '173.212.204.155': { lat: 51.2993, lng: 9.491, city: 'Kassel', country: 'Germany' },
  '173.249.43.109': { lat: 52.52, lng: 13.405, city: 'Berlin', country: 'Germany' },
  '207.180.203.27': { lat: 40.7128, lng: -74.006, city: 'New York', country: 'USA' },
  '159.69.208.95': { lat: 50.1109, lng: 8.6821, city: 'Frankfurt', country: 'Germany' },
  '78.46.89.147': { lat: 50.7374, lng: 7.0982, city: 'Bonn', country: 'Germany' },
  '195.201.194.190': { lat: 53.5511, lng: 9.9937, city: 'Hamburg', country: 'Germany' },
  // Add more mock data as needed
};

export function XandeumWorldMap({ pnodes }: XandeumWorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeLocation | null>(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  // Process nodes to get locations
  const nodeLocations: NodeLocation[] = pnodes.map(node => {
    const ip = node.address.split(':')[0];
    const geoData = mockGeoData[ip] || { 
      lat: Math.random() * 180 - 90, 
      lng: Math.random() * 360 - 180, 
      city: 'Unknown', 
      country: 'Unknown' 
    };
    
    return {
      ip,
      address: node.address,
      lat: geoData.lat,
      lng: geoData.lng,
      city: geoData.city,
      country: geoData.country,
      isOnline: node.isOnline,
      is_public: node.is_public,
      healthScore: node.healthScore,
      uptime: node.uptime,
    };
  });

  // Filter nodes based on toggle states
  const filteredLocations = nodeLocations.filter(location => {
    if (showOnlineOnly && !location.isOnline) return false;
    if (showPublicOnly && !location.is_public) return false;
    return true;
  });

  const getNodeColor = (location: NodeLocation) => {
    if (!location.isOnline) return '#ef4444'; // red
    if (location.healthScore >= 80) return '#22c55e'; // green
    if (location.healthScore >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getNodeSize = (location: NodeLocation) => {
    if (location.healthScore >= 80) return 8;
    if (location.healthScore >= 60) return 6;
    return 4;
  };

  // Stats for the map
  const stats = {
    total: nodeLocations.length,
    online: nodeLocations.filter(n => n.isOnline).length,
    public: nodeLocations.filter(n => n.is_public).length,
    avgHealth: nodeLocations.reduce((sum, n) => sum + n.healthScore, 0) / nodeLocations.length,
    countries: [...new Set(nodeLocations.map(n => n.country))].length,
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Xandeum Network Map
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Global distribution of Xandeum nodes across {stats.countries} countries
          </p>

          {/* Network Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.online}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Online</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.public}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Public</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.avgHealth.toFixed(0)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Health</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.countries}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Countries</div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showOnlineOnly 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {showOnlineOnly ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              Online Only
            </button>
            
            <button
              onClick={() => setShowPublicOnly(!showPublicOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showPublicOnly 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {showPublicOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Public Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* World Map Placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Node Distribution
              </h3>
              
              {/* SVG World Map Placeholder */}
              <div 
                ref={mapRef}
                className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-lg relative overflow-hidden"
              >
                {/* Simple dot visualization */}
                {filteredLocations.map((location, index) => {
                  // Convert lat/lng to x/y coordinates (simplified)
                  const x = ((location.lng + 180) / 360) * 100;
                  const y = ((90 - location.lat) / 180) * 100;
                  
                  return (
                    <div
                      key={`${location.address}-${index}`}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-all duration-200"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        backgroundColor: getNodeColor(location),
                        width: `${getNodeSize(location)}px`,
                        height: `${getNodeSize(location)}px`,
                        borderRadius: '50%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                      onClick={() => setSelectedNode(location)}
                      title={`${location.city}, ${location.country} - Health: ${location.healthScore}`}
                    />
                  );
                })}
                
                {/* Map overlay with grid */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%" className="text-gray-400">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Healthy (80+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Good (60-79)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Poor (&lt;60)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Node Details Panel */}
          <div className="space-y-6">
            {/* Selected Node Details */}
            {selectedNode ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Node Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {selectedNode.city}, {selectedNode.country}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-mono">{selectedNode.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Health: {selectedNode.healthScore}/100</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedNode.isOnline ? (
                      <Wifi className="w-4 h-4 text-green-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      {selectedNode.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedNode.is_public ? (
                      <Eye className="w-4 h-4 text-purple-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm">
                      {selectedNode.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
                    <div className="text-lg font-semibold">
                      {Math.floor(selectedNode.uptime / 86400)}d {Math.floor((selectedNode.uptime % 86400) / 3600)}h
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Node Details
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  Click on a node to view details
                </p>
              </div>
            )}

            {/* Top Locations */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Top Locations
              </h3>
              
              <div className="space-y-3">
                {Object.entries(
                  filteredLocations.reduce((acc, location) => {
                    const key = `${location.city}, ${location.country}`;
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([location, count]) => (
                    <div key={location} className="flex justify-between items-center">
                      <span className="text-sm">{location}</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}