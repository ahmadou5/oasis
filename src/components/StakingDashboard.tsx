'use client'

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchStakeAccounts } from '@/store/slices/stakingSlice'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { WalletBalance } from '@/components/WalletBalance'
import { StakeAccountCard } from './StakeAccountCard'
import { TransactionHistory } from './TransactionHistory'
import { LoadingSpinner } from './LoadingSpinner'
import { Wallet, TrendingUp, Clock, AlertCircle } from 'lucide-react'

export function StakingDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { connected, publicKey } = useWallet()
  const { stakeAccounts, totalStaked, totalRewards, loading, error } = useSelector(
    (state: RootState) => state.staking
  )

  useEffect(() => {
    if (connected && publicKey) {
      dispatch(fetchStakeAccounts(publicKey.toString()))
    }
  }, [connected, publicKey, dispatch])

  if (!connected) {
    return (
      <div className="card text-center py-12">
        <Wallet className="text-solana-gray-600 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
        <p className="text-solana-gray-400 mb-6">
          Connect your wallet to view your staking dashboard and manage your stakes.
        </p>
        <WalletMultiButton className="!bg-gradient-to-r !from-solana-purple !to-solana-blue hover:!from-solana-purple/90 hover:!to-solana-blue/90 !rounded-lg !font-semibold !transition-all !duration-200" />
      </div>
    )
  }

  if (loading && stakeAccounts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
        <p className="text-solana-gray-400 mb-4">{error}</p>
        <button
          onClick={() => publicKey && dispatch(fetchStakeAccounts(publicKey.toString()))}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (stakeAccounts.length === 0) {
    return (
      <div className="card text-center py-12">
        <TrendingUp className="text-solana-gray-600 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-4">No Active Stakes</h3>
        <p className="text-solana-gray-400 mb-6">
          You don't have any active stake accounts. Start staking to earn rewards on your SOL.
        </p>
        <a href="/validators" className="btn-primary">
          Browse Validators
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Enhanced Wallet Balance */}
        <WalletBalance 
          size="md"
          showLabel={true}
          showRefresh={true}
          className="hover:scale-105 transition-transform duration-200"
        />

        <div className="card bg-gradient-to-br from-solana-purple/20 to-solana-purple/10 border-solana-purple/20 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-sm font-medium mb-1">Total Staked</p>
              <p className="text-2xl font-bold">{totalStaked.toFixed(2)} SOL</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
              <TrendingUp className="text-solana-purple" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-solana-green/20 to-solana-green/10 border-solana-green/20 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-sm font-medium mb-1">Total Rewards</p>
              <p className="text-2xl font-bold text-solana-green">{totalRewards.toFixed(4)} SOL</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
              <TrendingUp className="text-solana-green" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-solana-blue/20 to-solana-blue/10 border-solana-blue/20 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-sm font-medium mb-1">Active Stakes</p>
              <p className="text-2xl font-bold">{stakeAccounts.filter(a => a.status === 'active').length}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
              <Clock className="text-solana-blue" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Stake Accounts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Stake Accounts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stakeAccounts.map((account) => (
            <StakeAccountCard key={account.address} stakeAccount={account} />
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <TransactionHistory />
    </div>
  )
}