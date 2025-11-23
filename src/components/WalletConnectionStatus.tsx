'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react'

export function WalletConnectionStatus() {
  const { connected, connecting } = useWallet()
  const { error } = useWalletBalance()

  if (connecting) {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm">
        <Wifi className="animate-pulse" size={16} />
        <span>Connecting...</span>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="flex items-center gap-2 text-solana-gray-400 text-sm">
        <WifiOff size={16} />
        <span>Not connected</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <AlertCircle size={16} />
        <span>Connection error</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-solana-green text-sm">
      <CheckCircle size={16} />
      <span>Connected</span>
    </div>
  )
}