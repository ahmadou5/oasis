'use client'

import { StakeAccount } from '@/store/slices/stakingSlice'
import { formatSOL, formatAddress, formatTimeAgo } from '@/utils/formatters'
import { TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

interface StakeAccountCardProps {
  stakeAccount: StakeAccount
}

export function StakeAccountCard({ stakeAccount }: StakeAccountCardProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-solana-green',
          bgColor: 'bg-solana-green/20',
          text: 'Active & Earning'
        }
      case 'activating':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          text: 'Activating'
        }
      case 'deactivating':
        return {
          icon: AlertTriangle,
          color: 'text-orange-400',
          bgColor: 'bg-orange-400/20',
          text: 'Deactivating'
        }
      case 'inactive':
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          text: 'Inactive'
        }
      default:
        return {
          icon: Clock,
          color: 'text-solana-gray-400',
          bgColor: 'bg-solana-gray-400/20',
          text: 'Unknown'
        }
    }
  }

  const statusInfo = getStatusInfo(stakeAccount.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="card hover:border-solana-purple/50 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">{stakeAccount.validatorName}</h3>
          <p className="text-solana-gray-400 text-sm">
            {formatAddress(stakeAccount.address)}
          </p>
        </div>
        
        <div className={clsx('flex items-center gap-2 px-3 py-1 rounded-full', statusInfo.bgColor)}>
          <StatusIcon className={statusInfo.color} size={16} />
          <span className={clsx('text-sm font-medium', statusInfo.color)}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Amount and Rewards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-solana-gray-400 text-xs mb-1">Staked Amount</p>
          <p className="text-xl font-bold">{formatSOL(stakeAccount.amount)}</p>
        </div>
        
        <div>
          <p className="text-solana-gray-400 text-xs mb-1">Earned Rewards</p>
          <p className="text-xl font-bold text-solana-green">
            {formatSOL(stakeAccount.rewards)}
          </p>
        </div>
      </div>

      {/* Epoch Information */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-solana-gray-400">Activation Epoch:</span>
          <span>{stakeAccount.activationEpoch}</span>
        </div>
        
        {stakeAccount.deactivationEpoch && (
          <div className="flex justify-between">
            <span className="text-solana-gray-400">Deactivation Epoch:</span>
            <span>{stakeAccount.deactivationEpoch}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-solana-gray-400">Created:</span>
          <span>{formatTimeAgo(stakeAccount.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-solana-gray-800">
        <div className="flex gap-2">
          {stakeAccount.status === 'active' && (
            <button className="btn-secondary text-sm py-2 px-4 flex-1">
              Unstake
            </button>
          )}
          
          <button className="btn-secondary text-sm py-2 px-4">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}