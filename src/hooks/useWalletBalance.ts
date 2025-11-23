'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { updateBalance } from '@/store/slices/walletSlice'

export function useWalletBalance() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const dispatch = useDispatch<AppDispatch>()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection || !connected) {
      console.log('Cannot fetch balance - missing requirements:', { 
        hasPublicKey: !!publicKey, 
        hasConnection: !!connection, 
        connected 
      })
      setBalance(0)
      dispatch(updateBalance(0))
      setError(null)
      return
    }

    console.log('Fetching balance for:', publicKey.toString())
    setLoading(true)
    setError(null)

    try {
      const balanceInLamports = await connection.getBalance(publicKey, 'confirmed')
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL
      
      console.log('Balance fetched successfully:', balanceInSOL, 'SOL')
      setBalance(balanceInSOL)
      dispatch(updateBalance(balanceInSOL))
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance'
      console.error('Error fetching wallet balance:', err)
      setError(errorMessage)
      // Don't reset balance to 0 on error, keep previous value
    } finally {
      setLoading(false)
    }
  }, [publicKey, connection, dispatch, connected])

  // Fetch balance when wallet connects or changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance()
    } else {
      setBalance(0)
      dispatch(updateBalance(0))
    }
  }, [connected, publicKey, fetchBalance, dispatch])

  // Set up real-time balance updates
  useEffect(() => {
    if (!publicKey || !connection || !connected) return

    let subscriptionId: number | null = null

    try {
      // Subscribe to account changes
      subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          const newBalance = accountInfo.lamports / LAMPORTS_PER_SOL
          setBalance(newBalance)
          dispatch(updateBalance(newBalance))
        },
        'confirmed'
      )
    } catch (error) {
      console.warn('Failed to set up balance subscription:', error)
    }

    return () => {
      if (subscriptionId !== null) {
        try {
          connection.removeAccountChangeListener(subscriptionId)
        } catch (error) {
          console.warn('Failed to remove balance subscription:', error)
        }
      }
    }
  }, [publicKey, connection, dispatch, connected])

  // Refresh balance manually
  const refreshBalance = useCallback(() => {
    if (connected) {
      fetchBalance()
    }
  }, [connected, fetchBalance])

  return {
    balance,
    loading,
    error,
    refreshBalance,
    connected,
    publicKey: publicKey?.toString() || null
  }
}