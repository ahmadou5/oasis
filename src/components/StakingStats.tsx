'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { WalletBalanceDisplay } from '@/components/WalletBalanceDisplay'
import { formatSOL } from '@/utils/formatters'
import { TrendingUp, Clock, Award, BarChart3 } from 'lucide-react'

export function StakingStats() {
  const { totalStaked, totalRewards } = useSelector((state: RootState) => state.staking)
  const { balance, connected } = useWalletBalance()

  const stats = [
    {
      title: 'Total Staked',
      value: connected ? formatSOL(totalStaked) : '--',
      icon: TrendingUp,
      color: 'text-solana-purple',
      bgColor: 'from-solana-purple/20 to-solana-purple/10',
      borderColor: 'border-solana-purple/20',
    },
    {
      title: 'Total Rewards',
      value: connected ? formatSOL(totalRewards) : '--',
      icon: Award,
      color: 'text-solana-green',
      bgColor: 'from-solana-green/20 to-solana-green/10',
      borderColor: 'border-solana-green/20',
    },
    {
      title: 'Avg. APY',
      value: connected && totalStaked > 0 ? '6.8%' : '--',
      icon: BarChart3,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-400/20 to-yellow-400/10',
      borderColor: 'border-yellow-400/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Wallet Balance - Featured */}
      <WalletBalanceDisplay 
        size="md"
        showLabel={true}
        showRefresh={true}
        variant="card"
        className="hover:scale-105 transition-transform duration-200"
      />
      
      {/* Other Stats */}
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`card bg-gradient-to-br ${stat.bgColor} ${stat.borderColor} hover:scale-105 transition-transform duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-sm font-medium mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5`}>
              <stat.icon className={`${stat.color}`} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}