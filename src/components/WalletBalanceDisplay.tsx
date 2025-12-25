'use client'

import { useWalletBalance } from '@/hooks/useWalletBalance'
import { formatSOL } from '@/utils/formatters'
import { Wallet, RefreshCw, AlertCircle } from 'lucide-react'
import { Skeleton } from './Skeleton'
import clsx from 'clsx'

interface WalletBalanceDisplayProps {
  className?: string
  showIcon?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'card' | 'inline'
  showRefresh?: boolean
}

export function WalletBalanceDisplay({
  className,
  showIcon = true,
  showLabel = true,
  size = 'md',
  variant = 'default',
  showRefresh = false
}: WalletBalanceDisplayProps) {
  const { balance, loading, error, refreshBalance, connected } = useWalletBalance()

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  if (!connected) {
    if (variant === 'card') {
      return (
        <div className={clsx('card bg-gradient-to-r from-gray-100 dark:from-solana-gray-800/50 to-gray-200 dark:to-solana-gray-700/50 border-gray-300 dark:border-solana-gray-700', className)}>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <Wallet className="text-gray-400 dark:text-solana-gray-500 mx-auto mb-2" size={24} />
              <p className="text-gray-500 dark:text-solana-gray-400 text-sm">Connect Wallet</p>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className={clsx('flex items-center gap-2 text-gray-500 dark:text-solana-gray-400', sizeClasses[size], className)}>
        {showIcon && <Wallet size={iconSizes[size]} />}
        <span>{showLabel ? 'Connect Wallet' : '--'}</span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={clsx('card bg-gradient-to-r from-solana-blue/20 to-solana-purple/20 border-solana-blue/30', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showIcon && (
              <div className="p-2 rounded-lg bg-solana-blue/20">
                <Wallet className="text-solana-blue" size={iconSizes[size]} />
              </div>
            )}
            <div>
              {showLabel && (
                <p className="text-solana-gray-400 text-sm font-medium mb-1">
                  Wallet Balance
                </p>
              )}
              <div className="flex items-center gap-2">
                {loading ? (
                  <Skeleton width="w-16" height="h-5" radius="sm" />
                ) : error ? (
                  <div className="flex items-center gap-1 text-red-400">
                    <AlertCircle size={14} />
                    <span className="text-sm">Error</span>
                  </div>
                ) : (
                  <p className={clsx('font-bold text-white', sizeClasses[size])}>
                    {formatSOL(balance)}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {showRefresh && (
            <button
              onClick={refreshBalance}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-solana-gray-800 transition-colors"
              title="Refresh balance"
            >
              <RefreshCw
                size={16}
                className={clsx(
                  'text-solana-gray-400 hover:text-white',
                  loading && 'animate-spin'
                )}
              />
            </button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={clsx('flex items-center gap-2', sizeClasses[size], className)}>
        {showIcon && <Wallet size={iconSizes[size]} className="text-solana-blue" />}
        {showLabel && <span className="text-solana-gray-400">Balance:</span>}
        {loading ? (
          <Skeleton width="w-16" height="h-5" radius="sm" />
        ) : error ? (
          <span className="text-red-400">Error</span>
        ) : (
          <span className="font-semibold text-white">{formatSOL(balance)}</span>
        )}
        {showRefresh && (
          <button
            onClick={refreshBalance}
            disabled={loading}
            className="p-1 rounded hover:bg-solana-gray-800 transition-colors"
          >
            <RefreshCw
              size={12}
              className={clsx(
                'text-solana-gray-400 hover:text-white',
                loading && 'animate-spin'
              )}
            />
          </button>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={clsx('flex items-center gap-2', sizeClasses[size], className)}>
      {showIcon && <Wallet size={iconSizes[size]} className="text-solana-blue" />}
      <div>
        {showLabel && (
          <p className="text-solana-gray-400 text-xs mb-1">Balance</p>
        )}
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton width="w-16" height="h-5" radius="sm" />
          ) : error ? (
            <span className="text-red-400 text-sm">Error loading balance</span>
          ) : (
            <span className="font-semibold text-white">{formatSOL(balance)}</span>
          )}
          {showRefresh && (
            <button
              onClick={refreshBalance}
              disabled={loading}
              className="p-1 rounded hover:bg-solana-gray-800 transition-colors"
            >
              <RefreshCw
                size={14}
                className={clsx(
                  'text-solana-gray-400 hover:text-white',
                  loading && 'animate-spin'
              )}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}