'use client'

import { FC, ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { getRPCEndpoint, ENV } from '@/config/env'

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css'

interface Props {
  children: ReactNode
}

export const WalletProvider: FC<Props> = ({ children }) => {
  // Get network from environment configuration
  const network = ENV.SOLANA.NETWORK === 'mainnet-beta' ? WalletAdapterNetwork.Mainnet :
                   ENV.SOLANA.NETWORK === 'testnet' ? WalletAdapterNetwork.Testnet :
                   WalletAdapterNetwork.Devnet

  // Use custom RPC endpoint from environment
  const endpoint = useMemo(() => getRPCEndpoint(), [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}