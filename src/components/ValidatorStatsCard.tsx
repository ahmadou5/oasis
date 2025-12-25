'use client'

import { useValidators } from '@/hooks/useValidators'
import { TrendingUp, Users, Coins, Percent } from 'lucide-react'
import { Skeleton } from './Skeleton'

export function ValidatorStatsCard() {
  const { stats, loading, error } = useValidators()

  if (loading) {
    return (
      <div className="card py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton width="w-1/3" height="h-6" />
          <Skeleton width="w-10" height="h-10" radius="full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30"
            >
              <Skeleton width="w-12" height="h-12" radius="full" className="mx-auto" />
              <div className="mt-3">
                <Skeleton width="w-2/3" height="h-6" className="mx-auto" />
                <Skeleton width="w-1/2" height="h-3" className="mx-auto mt-2" radius="sm" />
                <Skeleton width="w-2/3" height="h-3" className="mx-auto mt-2" radius="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <div className="text-red-400 mb-2">⚠️</div>
        <p className="text-red-400">Failed to load network statistics</p>
      </div>
    )
  }

  if (stats.totalValidators === 0) {
    return null
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-6 gradient-text flex items-center gap-2">
        <TrendingUp size={24} />
        Network Overview
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Validators */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-solana-green/10 to-solana-green/5">
          <div className="w-12 h-12 bg-solana-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="text-solana-green" size={24} />
          </div>
          <div className="text-2xl font-bold text-solana-green mb-1">
            {stats.activeValidators.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-solana-gray-400">Active Validators</div>
          <div className="text-xs text-gray-400 dark:text-solana-gray-500 mt-1">
            of {stats.totalValidators.toLocaleString()} total
          </div>
        </div>

        {/* Total Stake */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-solana-blue/10 to-solana-blue/5">
          <div className="w-12 h-12 bg-solana-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Coins className="text-solana-blue" size={24} />
          </div>
          <div className="text-2xl font-bold text-solana-blue mb-1">
            {(stats.totalStake / 1_000_000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-500 dark:text-solana-gray-400">Total Stake</div>
          <div className="text-xs text-gray-400 dark:text-solana-gray-500 mt-1">
            SOL Delegated
          </div>
        </div>

        {/* Average APY */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-solana-purple/10 to-solana-purple/5">
          <div className="w-12 h-12 bg-solana-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-solana-purple" size={24} />
          </div>
          <div className="text-2xl font-bold text-solana-purple mb-1">
            {stats.averageApy.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-solana-gray-400">Average APY</div>
          <div className="text-xs text-gray-400 dark:text-solana-gray-500 mt-1">
            Network Wide
          </div>
        </div>

        {/* Average Commission */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-400/10 to-yellow-400/5">
          <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Percent className="text-yellow-400" size={24} />
          </div>
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {stats.averageCommission.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-solana-gray-400">Avg Commission</div>
          <div className="text-xs text-gray-400 dark:text-solana-gray-500 mt-1">
            Validator Fees
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-solana-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {((stats.activeValidators / stats.totalValidators) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-solana-gray-400">Network Health</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(stats.totalStake / stats.totalValidators / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-500 dark:text-solana-gray-400">Avg Stake/Validator</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {Math.max(stats.averageApy - stats.averageCommission, 0).toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-solana-gray-400">Net APY</div>
          </div>
        </div>
      </div>
    </div>
  )
}