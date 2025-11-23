import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface StakeAccount {
  address: string
  validatorAddress: string
  validatorName: string
  amount: number
  status: 'active' | 'activating' | 'deactivating' | 'inactive'
  activationEpoch: number
  deactivationEpoch?: number
  rewards: number
  createdAt: number
}

export interface StakeTransaction {
  signature: string
  type: 'delegate' | 'undelegate' | 'withdraw'
  amount: number
  validatorAddress: string
  validatorName: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  blockTime?: number
}

interface StakingState {
  stakeAccounts: StakeAccount[]
  transactions: StakeTransaction[]
  totalStaked: number
  totalRewards: number
  loading: boolean
  error: string | null
  pendingTransactions: string[]
}

const initialState: StakingState = {
  stakeAccounts: [],
  transactions: [],
  totalStaked: 0,
  totalRewards: 0,
  loading: false,
  error: null,
  pendingTransactions: [],
}

export const fetchStakeAccounts = createAsyncThunk(
  'staking/fetchStakeAccounts',
  async (walletAddress: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stake-accounts/${walletAddress}`)
      if (!response.ok) {
        throw new Error('Failed to fetch stake accounts')
      }
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

export const delegateStake = createAsyncThunk(
  'staking/delegateStake',
  async (
    { validatorAddress, amount }: { validatorAddress: string; amount: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validatorAddress, amount }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to delegate stake')
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

const stakingSlice = createSlice({
  name: 'staking',
  initialState,
  reducers: {
    addPendingTransaction: (state, action: PayloadAction<string>) => {
      state.pendingTransactions.push(action.payload)
    },
    removePendingTransaction: (state, action: PayloadAction<string>) => {
      state.pendingTransactions = state.pendingTransactions.filter(
        (sig) => sig !== action.payload
      )
    },
    updateStakeAccount: (state, action: PayloadAction<StakeAccount>) => {
      const index = state.stakeAccounts.findIndex(
        (account) => account.address === action.payload.address
      )
      if (index >= 0) {
        state.stakeAccounts[index] = action.payload
      } else {
        state.stakeAccounts.push(action.payload)
      }
      
      // Recalculate totals
      state.totalStaked = state.stakeAccounts.reduce((sum, account) => sum + account.amount, 0)
      state.totalRewards = state.stakeAccounts.reduce((sum, account) => sum + account.rewards, 0)
    },
    addTransaction: (state, action: PayloadAction<StakeTransaction>) => {
      state.transactions.unshift(action.payload)
    },
    updateTransaction: (state, action: PayloadAction<{ signature: string; updates: Partial<StakeTransaction> }>) => {
      const index = state.transactions.findIndex(
        (tx) => tx.signature === action.payload.signature
      )
      if (index >= 0) {
        state.transactions[index] = { ...state.transactions[index], ...action.payload.updates }
      }
    },
    clearError: (state) => {
      state.error = null
    },
    reset: (state) => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStakeAccounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStakeAccounts.fulfilled, (state, action) => {
        state.loading = false
        state.stakeAccounts = action.payload.stakeAccounts || []
        state.transactions = action.payload.transactions || []
        state.totalStaked = state.stakeAccounts.reduce((sum, account) => sum + account.amount, 0)
        state.totalRewards = state.stakeAccounts.reduce((sum, account) => sum + account.rewards, 0)
      })
      .addCase(fetchStakeAccounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(delegateStake.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(delegateStake.fulfilled, (state, action) => {
        state.loading = false
        // Transaction will be added via addTransaction action
      })
      .addCase(delegateStake.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  addPendingTransaction,
  removePendingTransaction,
  updateStakeAccount,
  addTransaction,
  updateTransaction,
  clearError,
  reset,
} = stakingSlice.actions

export default stakingSlice.reducer