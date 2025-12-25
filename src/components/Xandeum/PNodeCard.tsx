'use client';

import React from 'react';
import Link from 'next/link';
import { XandeumNodeWithMetrics } from '@/types';
import {
  Shield,
  Users,
  Clock,
  Award,
  ExternalLink,
  Activity,
  Cpu,
  HardDrive,
  Network,
} from 'lucide-react';

interface PNodeCardProps {
  pnode: XandeumNodeWithMetrics;
}

export function PNodeCard({ pnode }: PNodeCardProps) {
  const formatStorage = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline 
      ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
      : 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVersionColor = (version: string) => {
    // Latest versions get green, older ones get orange/red
    if (version.includes('0.8.0')) return 'text-green-600';
    if (version.includes('0.7.3')) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                Node {pnode?.address?.split(':')[0]}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pnode?.isOnline)}`}>
                {pnode?.isOnline ? 'Online' : 'Offline'}
              </span>
              {pnode?.is_public && (
                <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30">
                  Public
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {pnode?.address} | Port: {pnode?.rpc_port}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              PubKey: {pnode?.pubkey?.substring(0, 20)}...
            </p>
          </div>
          
          {/* Health Score */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${getHealthScoreColor(pnode?.healthScore)}`}>
              {pnode?.healthScore}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Health</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-bold">{pnode?.uptimeDays}d</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-lg font-bold">{pnode?.storageCapacityGB}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Storage (GB)</div>
          </div>
        </div>

        {/* System + Network (get-stats) */}
        {pnode?.pnodeStats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50/80 dark:bg-slate-700/30 rounded-lg">
              <Cpu className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {pnode.pnodeStats.stats.cpu_percent.toFixed(1)}%
                </div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">CPU</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50/80 dark:bg-slate-700/30 rounded-lg">
              <Activity className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {formatStorage(pnode.pnodeStats.stats.ram_used)} / {formatStorage(pnode.pnodeStats.stats.ram_total)}
                </div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">RAM</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50/80 dark:bg-slate-700/30 rounded-lg">
              <Network className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {pnode.pnodeStats.stats.active_streams}
                </div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">Streams</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50/80 dark:bg-slate-700/30 rounded-lg">
              <HardDrive className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatStorage(pnode.pnodeStats.file_size)}
                </div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">File size</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Activity className="w-4 h-4" />
              <span>Storage Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pnode?.storage_usage_percent * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {pnode?.storageUtilization}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Health Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pnode?.healthScore}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {pnode?.healthScore}/100
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Award className="w-4 h-4" />
              <span>Version</span>
            </div>
            <span className={`text-sm font-medium ${getVersionColor(pnode?.version)}`}>
              {pnode?.versionDisplayName}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Last seen: {new Date(pnode?.lastSeenDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            <span>Storage: {pnode?.storageUsedMB.toFixed(1)} MB used</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Uptime: {pnode?.uptimeHours}h ({pnode?.uptimeDays} days)
          </div>
          
          <Link
            href={`/xandeum/${pnode?.address}`}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group-hover:translate-x-1"
          >
            View Details
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}