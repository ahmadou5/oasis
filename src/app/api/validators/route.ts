import { NextResponse } from 'next/server'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { getRPCEndpoint, getSolanaBeachHeaders, buildSolanaBeachURL, ENV } from '@/config/env'

// Solana Beach API types
interface SolanaBeachValidator {
  account: string
  name?: string
  website?: string
  description?: string
  avatar?: string
  details?: string
  location?: string
  country?: string
  keybaseUsername?: string
  twitterUsername?: string
}

// Known validator names mapping (fallback for validators not in Solana Beach)
const VALIDATOR_NAMES: Record<string, { name: string; website?: string; description?: string }> = {
  '7K8DVxtNJGnMtUY1CQJT5jcs8sFGSZTDiG7kowvFpECB': {
    name: 'Solana Foundation',
    website: 'https://solana.org',
    description: 'Official Solana Foundation validator node'
  },
  'Chorus6bBcLaFQdJwvfLzHVFrfhJqkpmALtcMpwY5n5w': {
    name: 'Chorus One',
    website: 'https://chorus.one',
    description: 'Secure staking infrastructure by Chorus One'
  },
  'StakeCitySS2jgX3CP3VhPM4qp2UaCQbNYFsAmptVrREX': {
    name: 'Stake.City',
    website: 'https://stake.city',
    description: 'Community-driven validator with competitive rewards'
  },
  'DfpdmTsSCBPxCDwZwgBMfjjV8mF5CWcLdcmd5bMFQQLa': {
    name: 'Figment',
    website: 'https://figment.io',
    description: 'Enterprise-grade staking infrastructure'
  },
  'Luck2j8pQKcPfMWqcLsWGBSTyVpJECfCX8CHG2PF8A6b': {
    name: 'Lido',
    website: 'https://lido.fi',
    description: 'Liquid staking protocol'
  },
  'Everstake4R7BdXGM7oN2vnhBNX58UhNeWCn2oK3cHFf': {
    name: 'Everstake',
    website: 'https://everstake.one',
    description: 'Professional validation services'
  },
  'StakeWiz8CUgbP7D6DUNaBhf9q7nMgz9jYS4Kx8shnGR': {
    name: 'StakeWiz',
    website: 'https://stakewiz.com',
    description: 'High-performance validator with low fees'
  },
  'JitoSol4lyTqGLArWJfZg9fhCjRQyS6nh5YGdfqisPc': {
    name: 'Jito Solana',
    website: 'https://jito.wtf',
    description: 'MEV-optimized Solana validator'
  },
  'MarinadeNat9PpQQ5CVzkMwVDeFkqacrXPLaYbHYtqf': {
    name: 'Marinade',
    website: 'https://marinade.finance',
    description: 'Liquid staking protocol for Solana'
  }
}

// Calculate APY based on epoch credits (simplified calculation)
function calculateAPY(epochCredits: [number, number, number][]): number {
  if (epochCredits.length < 5) return 0
  
  // Extract credits from epoch credits tuples
  const credits = epochCredits.map(([epoch, credits, prevCredits]) => credits)
  
  // Get average credits from last 5 epochs
  const recentCredits = credits.slice(-5)
  const avgCredits = recentCredits.reduce((sum, credits) => sum + credits, 0) / recentCredits.length
  
  // Approximate APY calculation (this is simplified)
  // In reality, you'd need more complex calculations considering inflation, commission, etc.
  const baseAPY = 6.5 // Base Solana inflation rate
  const performance = Math.min(avgCredits / 400, 1.2) // Scale performance (400 is approximate average)
  
  return Number((baseAPY * performance).toFixed(2))
}

// Calculate skip rate based on epoch credits
function calculateSkipRate(epochCredits: [number, number, number][]): number {
  if (epochCredits.length < 2) return 0
  
  // Extract credits from epoch credits tuples
  const credits = epochCredits.map(([epoch, credits, prevCredits]) => credits)
  
  // Count epochs with significantly lower credits
  const avgCredits = credits.reduce((sum, credits) => sum + credits, 0) / credits.length
  const lowPerformanceThreshold = avgCredits * 0.8
  const skippedEpochs = credits.filter(credits => credits < lowPerformanceThreshold).length
  
  return Number(((skippedEpochs / credits.length) * 100).toFixed(2))
}

// Fetch validator metadata from Solana Beach API
async function fetchSolanaBeachValidators(): Promise<Map<string, SolanaBeachValidator>> {
  try {
    console.log('Fetching validator metadata from Solana Beach...')
    
    const response = await fetch(buildSolanaBeachURL(ENV.SOLANA_BEACH.ENDPOINTS.VALIDATORS), {
      headers: getSolanaBeachHeaders()
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch from Solana Beach, using fallback data')
      return new Map()
    }
    
    const validators: SolanaBeachValidator[] = await response.json()
    const validatorMap = new Map<string, SolanaBeachValidator>()
    
    validators.forEach(validator => {
      validatorMap.set(validator.account, validator)
    })
    
    console.log(`Loaded metadata for ${validators.length} validators from Solana Beach`)
    return validatorMap
  } catch (error) {
    console.warn('Error fetching Solana Beach data:', error)
    return new Map()
  }
}

// Fetch additional performance data from Solana Beach
async function fetchValidatorPerformance(validatorAddress: string): Promise<{
  performanceHistory: Array<{ epoch: number; apy: number; skipRate: number; credits: number }>
  uptime: number
  averageApy: number
}> {
  try {
    const response = await fetch(buildSolanaBeachURL(ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_EPOCHS(validatorAddress, 30)), {
      headers: getSolanaBeachHeaders()
    })
    
    if (!response.ok) {
      return { performanceHistory: [], uptime: 0, averageApy: 0 }
    }
    
    const epochData = await response.json()
    const performanceHistory = epochData.map((epoch: any) => ({
      epoch: epoch.epoch,
      apy: epoch.apy || 0,
      skipRate: epoch.skipRate || 0,
      credits: epoch.credits || 0
    }))
    
    const uptime = epochData.length > 0 ? 
      (epochData.filter((e: any) => e.credits > 0).length / epochData.length) * 100 : 0
    
    const averageApy = epochData.length > 0 ?
      epochData.reduce((sum: number, e: any) => sum + (e.apy || 0), 0) / epochData.length : 0
    
    return { performanceHistory, uptime, averageApy }
  } catch (error) {
    console.warn(`Error fetching performance for ${validatorAddress}:`, error)
    return { performanceHistory: [], uptime: 0, averageApy: 0 }
  }
}

export async function GET() {
  try {
    console.log('Fetching validators from Solana network...')
    
    // Get RPC endpoint from environment configuration
    const rpcEndpoint = getRPCEndpoint()
    console.log('Using RPC endpoint:', rpcEndpoint)
    const connection = new Connection(rpcEndpoint, 'confirmed')
    
    // Fetch validator metadata from Solana Beach in parallel
    const [voteAccounts, beachValidators] = await Promise.all([
      connection.getVoteAccounts(),
      fetchSolanaBeachValidators()
    ])
    
    console.log(`Fetched ${voteAccounts.current.length} current validators and ${voteAccounts.delinquent.length} delinquent validators`)
    
    // Combine current and delinquent validators
    const allValidators = [
      ...voteAccounts.current.map(account => ({ ...account, status: 'active' as const })),
      ...voteAccounts.delinquent.map(account => ({ ...account, status: 'delinquent' as const }))
    ]
    
    // Transform to our validator format with enhanced metadata
    const validators = await Promise.all(allValidators.slice(0, 100).map(async account => { // Limit to 100 for performance
      // Get metadata from Solana Beach or fallback
      const beachData = beachValidators.get(account.votePubkey)
      const fallbackData = VALIDATOR_NAMES[account.votePubkey]
      
      const validatorInfo = {
        name: beachData?.name || fallbackData?.name || `Validator ${account.votePubkey.slice(0, 8)}...`,
        description: beachData?.description || beachData?.details || fallbackData?.description || 'Solana validator node',
        website: beachData?.website || fallbackData?.website,
        avatar: beachData?.avatar,
        location: beachData?.location,
        country: beachData?.country,
        keybaseUsername: beachData?.keybaseUsername,
        twitterUsername: beachData?.twitterUsername
      }
      
      const apy = calculateAPY(account.epochCredits)
      const skipRate = calculateSkipRate(account.epochCredits)
      const stakeAmount = account.activatedStake / 1000000000 // Convert lamports to SOL
      
      // Get performance history for top validators
      let performanceData: {
        performanceHistory: Array<{ epoch: number; apy: number; skipRate: number; credits: number }>
        uptime: number
        averageApy: number
      } = { performanceHistory: [], uptime: 0, averageApy: apy }
      
      if (stakeAmount > 1000000) { // Only fetch for validators with >1M SOL stake
        try {
          performanceData = await fetchValidatorPerformance(account.votePubkey)
        } catch (error) {
          console.warn(`Failed to fetch performance for ${account.votePubkey}`)
        }
      }
      
      return {
        address: account.votePubkey,
        name: validatorInfo.name,
        commission: account.commission,
        stake: stakeAmount,
        apy: performanceData.averageApy > 0 ? performanceData.averageApy : apy,
        delegatedStake: stakeAmount,
        skipRate: skipRate,
        dataCenter: validatorInfo.location || 'Unknown',
        website: validatorInfo.website,
        description: validatorInfo.description,
        avatar: validatorInfo.avatar || '',
        status: account.status,
        epochCredits: account.epochCredits.map(([epoch, credits, prevCredits]) => credits).slice(-10), // Last 10 epochs
        votingPubkey: account.votePubkey,
        activatedStake: account.activatedStake,
        lastVote: account.lastVote,
        rootSlot: 0,
        // Enhanced metadata
        country: validatorInfo.country,
        keybaseUsername: validatorInfo.keybaseUsername,
        twitterUsername: validatorInfo.twitterUsername,
        uptime: performanceData.uptime,
        performanceHistory: performanceData.performanceHistory
      }
    }))
    
    // Sort by stake amount (descending) by default
    validators.sort((a, b) => b.stake - a.stake)
    
    console.log(`Processed ${validators.length} validators with enhanced metadata`)
    
    return NextResponse.json(validators)
  } catch (error) {
    console.error('Error fetching validators:', error)
    return NextResponse.json(
      { error: 'Failed to fetch validators from Solana network', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}