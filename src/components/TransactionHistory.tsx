'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { formatSOL, formatAddress, formatTimeAgo } from '@/utils/formatters'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

export function TransactionHistory() {
  const { transactions } = useSelector((state: RootState) => state.staking)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'delegate':
        return ArrowUpRight
      case 'undelegate':
      case 'withdraw':
        return ArrowDownLeft
      default:
        return Clock
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle
      case 'failed':
        return XCircle
      case 'pending':
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-solana-green'
      case 'failed':
        return 'text-red-400'
      case 'pending':
      default:
        return 'text-yellow-400'
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <Clock className="text-solana-gray-600 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-semibold mb-2">No Transaction History</h3>
        <p className="text-solana-gray-400">
          Your staking transactions will appear here once you start delegating.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
      
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const TransactionIcon = getTransactionIcon(transaction.type)
          const StatusIcon = getStatusIcon(transaction.status)
          
          return (
            <div
              key={transaction.signature}
              className="flex items-center justify-between p-4 rounded-lg bg-solana-gray-900/30 border border-solana-gray-800 hover:border-solana-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Transaction Type Icon */}
                <div className="p-2 rounded-full bg-solana-purple/20">
                  <TransactionIcon className="text-solana-purple" size={20} />
                </div>
                
                {/* Transaction Details */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold capitalize">{transaction.type}</span>
                    <StatusIcon className={clsx('', getStatusColor(transaction.status))} size={16} />
                    <span className={clsx('text-sm capitalize', getStatusColor(transaction.status))}>
                      {transaction.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-solana-gray-400">
                    <span>{formatSOL(transaction.amount)} to {transaction.validatorName}</span>
                    <span className="mx-2">•</span>
                    <span>{formatTimeAgo(transaction.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              {/* Transaction Signature */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-sm text-solana-gray-400">
                    {formatAddress(transaction.signature, 6)}
                  </div>
                  {transaction.blockTime && (
                    <div className="text-xs text-solana-gray-500">
                      Block: {transaction.blockTime}
                    </div>
                  )}
                </div>
                
                <a
                  href={`https://explorer.solana.com/tx/${transaction.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-solana-gray-800 transition-colors"
                >
                  <ExternalLink className="text-solana-gray-400 hover:text-white" size={16} />
                </a>
              </div>
            </div>
          )
        })}
      </div>
      
      {transactions.length > 5 && (
        <div className="text-center mt-6">
          <button className="btn-secondary text-sm">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  )
}