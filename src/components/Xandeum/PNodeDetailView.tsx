'use client';

import React from 'react';
import { XandeumNodeWithMetrics } from '@/types';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Award,
  Clock,
  DollarSign,
  Activity,
  Globe,
  Users,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';

interface PNodeDetailViewProps {
  pnode: XandeumNodeWithMetrics;
}

export function PNodeDetailView({ pnode }: PNodeDetailViewProps) {
  const formatStake = (stake: number) => {
    const sol = stake / 1e9;
    if (sol >= 1e6) return `${(sol / 1e6).toFixed(2)}M SOL`;
    if (sol >= 1e3) return `${(sol / 1e3).toFixed(2)}K SOL`;
    return `${sol.toFixed(2)} SOL`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'delinquent': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Node {pnode.address.split(':')[0]}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pnode.isOnline ? 'active' : 'inactive')}`}>
                {pnode.isOnline ? 'Online' : 'Offline'}
              </span>
              {pnode.is_public && (
                <span className="px-3 py-1 rounded-full text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30">
                  Public
                </span>
              )}
            </div>
            
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p className="font-mono text-sm break-all">
                <span className="font-semibold">Address:</span> {pnode.address}
              </p>
              <p className="text-sm">
                <span className="font-semibold">PubKey:</span> {pnode.pubkey.substring(0, 32)}...
              </p>
              <p className="text-sm">
                <span className="font-semibold">Version:</span> {pnode.version}
              </p>
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <div className={`text-4xl font-bold ${getScoreColor(pnode.healthScore)} mb-2`}>
              {pnode.healthScore}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Health Score</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {pnode.xendiumApy.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Annual APY</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatStake(pnode.totalPnodeStake)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Staked</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {pnode.xendiumCommission}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Commission</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                #{pnode.pnodeRank || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Network Rank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Stats */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Efficiency
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {pnode.efficiency}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pnode.efficiency}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Reliability
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {pnode.reliability}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pnode.reliability}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Network Contribution
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {pnode.networkContribution.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pnode.networkContribution)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Staking Information */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Staking Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-slate-700/50">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Min Stake Amount</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatStake(pnode.minStakeAmount)}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-slate-700/50">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Stake Amount</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatStake(pnode.maxStakeAmount)}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-slate-700/50">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Lock Period
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {pnode.lockPeriod} epochs
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-slate-700/50">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Early Withdraw Penalty</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {pnode.earlyWithdrawPenalty}%
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reward Structure</span>
              <span className="font-semibold text-gray-900 dark:text-white capitalize">
                {pnode.rewardStructure}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Node Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Payout</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatDate(pnode.lastPayout)}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Next Payout Epoch</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {pnode.nextPayoutEpoch}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data Center</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {pnode.dataCenter || 'Unknown'}
            </div>
          </div>
          
          {pnode.country && (
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Country
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {pnode.country}
              </div>
            </div>
          )}
          
          {pnode.website && (
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Website</div>
              <a 
                href={pnode.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Visit Website
              </a>
            </div>
          )}
          
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Uptime</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {pnode.uptime?.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}