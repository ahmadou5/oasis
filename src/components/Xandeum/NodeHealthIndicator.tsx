'use client';

import React from 'react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { XandeumNodeWithMetrics } from '@/types';

interface NodeHealthIndicatorProps {
  node: XandeumNodeWithMetrics;
  variant?: 'compact' | 'detailed' | 'badge';
  showTooltip?: boolean;
}

export function NodeHealthIndicator({ 
  node, 
  variant = 'compact', 
  showTooltip = true 
}: NodeHealthIndicatorProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-300' };
    if (score >= 60) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-300' };
    if (score >= 40) return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300' };
    return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-300' };
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return CheckCircle2;
    if (score >= 60) return Shield;
    if (score >= 40) return AlertTriangle;
    return XCircle;
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const colors = getHealthColor(node.healthScore);
  const HealthIcon = getHealthIcon(node.healthScore);
  const healthLabel = getHealthLabel(node.healthScore);

  if (variant === 'badge') {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
        title={showTooltip ? `Health Score: ${node.healthScore}/100 - ${healthLabel}` : undefined}
      >
        <HealthIcon className="w-3 h-3" />
        {node.healthScore}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} border ${colors.border}`}>
          <HealthIcon className={`w-4 h-4 ${colors.text}`} />
          <div>
            <div className={`text-sm font-semibold ${colors.text}`}>
              {node.healthScore}/100
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {healthLabel}
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2">
          {node.isOnline ? (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </div>
          )}

          {node.is_public && (
            <div className="flex items-center gap-1 text-blue-600 text-xs">
              <Shield className="w-3 h-3" />
              <span>Public</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant
  return (
    <div className="space-y-4">
      {/* Main health score */}
      <div className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HealthIcon className={`w-5 h-5 ${colors.text}`} />
            <span className={`font-semibold ${colors.text}`}>Health Score</span>
          </div>
          <div className={`text-2xl font-bold ${colors.text}`}>
            {node.healthScore}/100
          </div>
        </div>
        
        {/* Health score breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span>Network Status</span>
            <span className={node.isOnline ? 'text-green-600' : 'text-red-600'}>
              {node.isOnline ? '+30' : '0'} pts
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Public Access</span>
            <span className={node.is_public ? 'text-blue-600' : 'text-gray-500'}>
              {node.is_public ? '+10' : '0'} pts
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Uptime Score</span>
            <span className="text-yellow-600">
              +{Math.min(40, Math.floor(node.uptime / 86400))} pts
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Storage Efficiency</span>
            <span className="text-purple-600">
              +{Math.min(20, Math.floor((1 - node.storage_usage_percent) * 20))} pts
            </span>
          </div>
        </div>
      </div>

      {/* Detailed metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Uptime</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {node.uptimeDays}d
          </div>
          <div className="text-xs text-gray-500">
            {node.uptimeHours}h total
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Storage</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {node.storageUtilization}
          </div>
          <div className="text-xs text-gray-500">
            {node.storageUsedMB.toFixed(1)}MB used
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <div className={`text-lg font-bold ${node.isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {node.isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="text-xs text-gray-500">
            Last seen: {new Date(node.lastSeenDate).toLocaleDateString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium">Access</span>
          </div>
          <div className={`text-lg font-bold ${node.is_public ? 'text-blue-600' : 'text-gray-600'}`}>
            {node.is_public ? 'Public' : 'Private'}
          </div>
          <div className="text-xs text-gray-500">
            Version: {node.versionDisplayName}
          </div>
        </div>
      </div>
    </div>
  );
}

// Health Score Progress Bar Component
interface HealthScoreBarProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function HealthScoreBar({ 
  score, 
  size = 'md', 
  showLabel = true, 
  className = '' 
}: HealthScoreBarProps) {
  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  const barColor = getBarColor(score);
  const sizeClass = getSizeClasses(size);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 bg-gray-200 dark:bg-slate-700 rounded-full ${sizeClass}`}>
        <div 
          className={`${barColor} ${sizeClass} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[3rem]">
          {score}/100
        </span>
      )}
    </div>
  );
}