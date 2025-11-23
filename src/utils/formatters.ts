/**
 * Format a number as SOL currency
 */
export function formatSOL(amount: number): string {
  if (amount === 0) return '0 SOL'
  if (amount < 0.001) return '<0.001 SOL'
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: amount >= 1 ? 2 : 3,
    maximumFractionDigits: amount >= 1 ? 2 : 6,
  }).format(amount) + ' SOL'
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

/**
 * Format a large number with appropriate suffixes
 */
export function formatNumber(num: number): string {
  if (num === 0) return '0'
  
  const units = ['', 'K', 'M', 'B', 'T']
  const k = 1000
  const magnitude = Math.floor(Math.log(num) / Math.log(k))
  
  if (magnitude === 0) {
    return num.toLocaleString()
  }
  
  const value = num / Math.pow(k, magnitude)
  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2
  
  return value.toFixed(decimals) + units[magnitude]
}

/**
 * Format address with ellipsis
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2) return address
  
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

/**
 * Format time ago
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diffInSeconds = Math.floor((now - timestamp) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}d ago`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths}mo ago`
}

/**
 * Calculate staking rewards
 */
export function calculateRewards(
  stakeAmount: number,
  apy: number,
  epochs: number = 1
): number {
  // Solana has ~2.5 days per epoch on average
  const epochsPerYear = 365 / 2.5
  const rewardPerEpoch = (stakeAmount * apy / 100) / epochsPerYear
  return rewardPerEpoch * epochs
}

/**
 * Validate SOL amount input
 */
export function validateSOLAmount(value: string, maxAmount?: number): {
  isValid: boolean
  error?: string
  amount?: number
} {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Amount is required' }
  }
  
  const amount = parseFloat(value)
  
  if (isNaN(amount)) {
    return { isValid: false, error: 'Invalid amount format' }
  }
  
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' }
  }
  
  if (amount < 0.001) {
    return { isValid: false, error: 'Minimum stake amount is 0.001 SOL' }
  }
  
  if (maxAmount !== undefined && amount > maxAmount) {
    return { isValid: false, error: `Amount exceeds available balance (${formatSOL(maxAmount)})` }
  }
  
  return { isValid: true, amount }
}