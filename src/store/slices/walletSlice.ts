import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Connection, PublicKey } from '@solana/web3.js'

interface WalletState {
  connected: boolean
  connecting: boolean
  publicKey: string | null
  balance: number
  connection: Connection | null
  network: 'mainnet-beta' | 'testnet' | 'devnet'
}

const initialState: WalletState = {
  connected: false,
  connecting: false,
  publicKey: null,
  balance: 0,
  connection: null,
  network: 'mainnet-beta',
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.connecting = action.payload
    },
    setConnected: (state, action: PayloadAction<{ publicKey: string; balance: number }>) => {
      state.connected = true
      state.connecting = false
      state.publicKey = action.payload.publicKey
      state.balance = action.payload.balance
    },
    setDisconnected: (state) => {
      state.connected = false
      state.connecting = false
      state.publicKey = null
      state.balance = 0
    },
    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload
    },
    setConnection: (state, action: PayloadAction<Connection>) => {
      state.connection = action.payload
    },
    setNetwork: (state, action: PayloadAction<'mainnet-beta' | 'testnet' | 'devnet'>) => {
      state.network = action.payload
    },
  },
})

export const {
  setConnecting,
  setConnected,
  setDisconnected,
  updateBalance,
  setConnection,
  setNetwork,
} = walletSlice.actions

export default walletSlice.reducer