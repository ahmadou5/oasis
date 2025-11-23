'use client'

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { useState } from 'react'

export function DebugWalletInfo() {
  const [showDebug, setShowDebug] = useState(false)
  const { publicKey, connected, connecting, wallet } = useWallet()
  const { connection } = useConnection()
  const { balance, loading, error } = useWalletBalance()

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-solana-purple text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Wallet Debug</h3>
        <button onClick={() => setShowDebug(false)} className="text-red-400">×</button>
      </div>
      
      <div className="space-y-1">
        <div>Connected: {connected ? '✅' : '❌'}</div>
        <div>Connecting: {connecting ? '⏳' : '❌'}</div>
        <div>Wallet: {wallet?.adapter.name || 'None'}</div>
        <div>PublicKey: {publicKey ? '✅' : '❌'}</div>
        <div>Connection: {connection ? '✅' : '❌'}</div>
        <div>Balance: {balance} SOL</div>
        <div>Loading: {loading ? '⏳' : '❌'}</div>
        <div>Error: {error || 'None'}</div>
        {publicKey && (
          <div className="mt-2 break-all">
            Address: {publicKey.toString().slice(0, 20)}...
          </div>
        )}
      </div>
    </div>
  )
}