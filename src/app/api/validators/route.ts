import { NextResponse } from "next/server";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import {
  getRPCEndpoint,
  getSolanaBeachHeaders,
  buildSolanaBeachURL,
  ENV,
} from "@/config/env";
import axios from "axios";

// 1. Define interfaces based on the Documentation provided
interface ValidatorDetailsResponse {
  votePubkey: string;
  nodePubkey: string;
  // ... other fields
}

interface SuccessRateItem {
  epoch: number;
  slots: number;
  blocks: number;
  successRate: number; // Likely a decimal 0.0 to 1.0 or percentage
}

interface BlockRewardItem {
  epoch: number;
  blocks: number;
  fees: number;
}

interface ApiHistoryResponse<T> {
  history: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}

// Add epoch details interface
interface EpochDetails {
  epoch: number;
  startSlot: number;
  endSlot: number;
  totalTransactions: number;
  leader?: {
    votePubkey: string;
    name: string;
    blocksProduced: number;
  };
  blockRewards: {
    totalBlocks: number;
    totalFees: number;
  };
}

// Enhanced validator interface with epoch data
interface EnhancedValidator {
  address: string;
  name: string;
  commission: number;
  stake: number;
  apy: number;
  delegatedStake: number;
  skipRate: number;
  dataCenter: string;
  website?: string;
  description: string;
  avatar: string;
  status: "active" | "delinquent";
  epochCredits: number[];
  votingPubkey: string;
  activatedStake: number;
  lastVote: number;
  rootSlot: number;
  country?: string;
  keybaseUsername?: string;
  twitterUsername?: string;
  uptime: number;
  performanceHistory: Array<{
    epoch: number;
    activeStake: number;
    activeStakeAccounts: number;
    skipRate: number;
    credits: number;
    apy: number;
  }>;
  // NEW: Epoch details
  currentEpoch?: EpochDetails;
  epochHistory?: EpochDetails[];
}

interface CSolanaBeachValidator {
  votePubkey: string;
  name: string;
  iconUrl: string;
  version: string;
  activatedStake: number;
  stakeAccounts: number;
  commission: number;
  lastVote: number;
  // Based on the schema "true | false", this should be a boolean
  delinquent: boolean;
}

// Solana Beach API types
interface SolanaBeachValidator {
  account: string;
  name?: string;
  website?: string;
  description?: string;
  avatar?: string;
  details?: string;
  location?: string;
  country?: string;
  keybaseUsername?: string;
  twitterUsername?: string;
}
interface SolanaBeachValidatorsResponse {
  averageLastVote: number;
  validatorList: CSolanaBeachValidator[]; // The array we want
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}

interface SolanaBeachValidatorResponse {
  response: {
    votePubkey: string;
    nodePubkey: string;
    commission: number;
    lastVote: number;
    delinquent: boolean;
    name: string;
    iconUrl: string;
    website: string;
    details: string;
    version: string;
    continent: string;
    country: string;
    region: string;
    city: string;
    asn: number;
    asnOrganization: string;
  };
}

// Known validator names mapping (fallback for validators not in Solana Beach)
const VALIDATOR_NAMES: Record<
  string,
  { name: string; website?: string; description?: string }
> = {
  "7K8DVxtNJGnMtUY1CQJT5jcs8sFGSZTDiG7kowvFpECB": {
    name: "Solana Foundation",
    website: "https://solana.org",
    description: "Official Solana Foundation validator node",
  },
  Chorus6bBcLaFQdJwvfLzHVFrfhJqkpmALtcMpwY5n5w: {
    name: "Chorus One",
    website: "https://chorus.one",
    description: "Secure staking infrastructure by Chorus One",
  },
  StakeCitySS2jgX3CP3VhPM4qp2UaCQbNYFsAmptVrREX: {
    name: "Stake.City",
    website: "https://stake.city",
    description: "Community-driven validator with competitive rewards",
  },
  DfpdmTsSCBPxCDwZwgBMfjjV8mF5CWcLdcmd5bMFQQLa: {
    name: "Figment",
    website: "https://figment.io",
    description: "Enterprise-grade staking infrastructure",
  },
  Luck2j8pQKcPfMWqcLsWGBSTyVpJECfCX8CHG2PF8A6b: {
    name: "Lido",
    website: "https://lido.fi",
    description: "Liquid staking protocol",
  },
  Everstake4R7BdXGM7oN2vnhBNX58UhNeWCn2oK3cHFf: {
    name: "Everstake",
    website: "https://everstake.one",
    description: "Professional validation services",
  },
  StakeWiz8CUgbP7D6DUNaBhf9q7nMgz9jYS4Kx8shnGR: {
    name: "StakeWiz",
    website: "https://stakewiz.com",
    description: "High-performance validator with low fees",
  },
  JitoSol4lyTqGLArWJfZg9fhCjRQyS6nh5YGdfqisPc: {
    name: "Jito Solana",
    website: "https://jito.wtf",
    description: "MEV-optimized Solana validator",
  },
  MarinadeNat9PpQQ5CVzkMwVDeFkqacrXPLaYbHYtqf: {
    name: "Marinade",
    website: "https://marinade.finance",
    description: "Liquid staking protocol for Solana",
  },
};

/**
 * Fetch epoch details from Solana Beach API
 */
async function fetchEpochDetails(
  votePubkey: string,
  limit: number = 10
): Promise<EpochDetails[]> {
  try {
    // Fetch block rewards history
    const rewardsRes = await axios.get(
      buildSolanaBeachURL(
        ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_BLOCK_REWARDS_(votePubkey, limit)
      ),
      { headers: getSolanaBeachHeaders() }
    );

    if (!rewardsRes.data) return [];

    const rewardsData = rewardsRes.data;

    console.log(`Fetched epoch details for ${votePubkey}:`, rewardsData);

    return rewardsData.history.map((item: any) => ({
      epoch: item.epoch,
      blockRewards: {
        totalBlocks: item.blocks,
        totalFees: item.fees,
      },
    }));
  } catch (error) {
    console.warn(`Error fetching epoch details for ${votePubkey}:`, error);
    return [];
  }
}

/**
 * Fetch current epoch information from cluster
 */
async function fetchCurrentEpochInfo(): Promise<{
  epoch: number;
  absoluteSlot: number;
  slotIndex: number;
  slotsInEpoch: number;
  transactionCount: number;
} | null> {
  try {
    const response = await fetch(
      buildSolanaBeachURL(ENV.SOLANA_BEACH.ENDPOINTS.EPOCH_INFO(30)),
      { headers: getSolanaBeachHeaders() }
    );

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Error fetching current epoch info:", error);
    return null;
  }
}

// Calculate APY based on epoch credits (simplified calculation)
function calculateAPY(epochCredits: [number, number, number][]): number {
  if (epochCredits.length < 5) return 0;

  // Extract credits from epoch credits tuples
  const credits = epochCredits.map(([epoch, credits, prevCredits]) => credits);

  // Get average credits from last 5 epochs
  const recentCredits = credits.slice(-5);
  const avgCredits =
    recentCredits.reduce((sum, credits) => sum + credits, 0) /
    recentCredits.length;

  // Approximate APY calculation (this is simplified)
  // In reality, you'd need more complex calculations considering inflation, commission, etc.
  const baseAPY = 6.5; // Base Solana inflation rate
  const performance = Math.min(avgCredits / 400, 1.2); // Scale performance (400 is approximate average)

  return Number((baseAPY * performance).toFixed(2));
}

// Calculate skip rate based on epoch credits
function calculateSkipRate(epochCredits: [number, number, number][]): number {
  if (epochCredits.length < 2) return 0;

  // Extract credits from epoch credits tuples
  const credits = epochCredits.map(([epoch, credits, prevCredits]) => credits);

  // Count epochs with significantly lower credits
  const avgCredits =
    credits.reduce((sum, credits) => sum + credits, 0) / credits.length;
  const lowPerformanceThreshold = avgCredits * 0.8;
  const skippedEpochs = credits.filter(
    (credits) => credits < lowPerformanceThreshold
  ).length;

  return Number(((skippedEpochs / credits.length) * 100).toFixed(2));
}

// Fetch validator metadata from Solana Beach API
// Fetch validator metadata from Solana Beach API
async function fetchSolanaBeachValidators(): Promise<
  Map<string, CSolanaBeachValidator>
> {
  try {
    console.log("Fetching validator metadata from Solana Beach...");

    // 1. Await the Axios call to get the response object
    const response = await axios.get<SolanaBeachValidatorsResponse>( // Use a generic type here
      buildSolanaBeachURL(ENV.SOLANA_BEACH.ENDPOINTS.VALIDATORS),
      { headers: getSolanaBeachHeaders() }
    );

    if (!response.data) {
      console.warn("Failed to fetch from Solana Beach, using fallback data");
      return new Map();
    }

    // 2. Get the full response object from the .data property (NO 'await')
    const fullResponse: SolanaBeachValidatorsResponse = response.data;

    // 3. Extract the actual array of validators
    const validatorsArray: CSolanaBeachValidator[] = fullResponse.validatorList;

    const validatorMap = new Map<string, CSolanaBeachValidator>();

    validatorsArray.forEach((validator) => {
      // Use 'votePubkey' as the unique key based on the schema
      validatorMap.set(validator.votePubkey, validator);
    });

    return validatorMap;
  } catch (error) {
    console.warn("Error fetching Solana Beach data:", error);
    return new Map();
  }
}

// Define interfaces for the new data types based on docs
interface StakeHistoryItem {
  epoch: number;
  activatedStake: number;
}

interface StakeAccountsItem {
  epoch: number;
  stakeAccounts: number;
}

async function fetchValidatorPerformance2(validatorAddress: string): Promise<{
  performanceHistory: Array<{
    epoch: number;
    activeStake: number; // NEW: Active stake in Lamports
    activeStakeAccounts: number; // NEW: Number of delegators
    skipRate: number;
    credits: number;
    apy: number; // Kept as 0 to prevent type errors in UI
  }>;
  uptime: number;
  averageApy: number; // Kept as 0 to prevent type errors in UI
}> {
  try {
    // STEP 1: Fetch Validator Details to get the Node Pubkey
    // Required because Success Rate/Block Rewards use NodePubkey, while Stake uses VotePubkey
    const detailsRes = await fetch(
      buildSolanaBeachURL(
        ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_DETAIL(validatorAddress)
      ),
      { headers: getSolanaBeachHeaders() }
    );

    if (!detailsRes.ok) throw new Error("Failed to fetch validator details");

    const details: ValidatorDetailsResponse = await detailsRes.json();
    const nodePubkey = details.nodePubkey;

    // STEP 2: Fetch ALL History Data in parallel (4 endpoints)
    const [successRes, rewardsRes, stakeRes, stakeAccountsRes] =
      await Promise.all([
        // 1. Success Rate (Uses Node Pubkey)
        fetch(
          buildSolanaBeachURL(
            ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_SUCCESS_RATE_HISTORY(
              nodePubkey,
              30
            )
          ),
          { headers: getSolanaBeachHeaders() }
        ),
        // 2. Block Rewards (Uses Node Pubkey)
        fetch(
          buildSolanaBeachURL(
            ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_BLOCK_REWARDS_(nodePubkey, 30)
          ),
          { headers: getSolanaBeachHeaders() }
        ),
        // 3. Stake History (Uses Vote Pubkey / validatorAddress)
        fetch(
          buildSolanaBeachURL(
            ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_STAKE_HISTORY(
              validatorAddress,
              30
            )
          ),
          { headers: getSolanaBeachHeaders() }
        ),
        // 4. Stake Accounts History (Uses Vote Pubkey / validatorAddress)
        fetch(
          buildSolanaBeachURL(
            ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_STAKE_ACCOUNTS_HISTORY(
              validatorAddress,
              30
            )
          ),
          { headers: getSolanaBeachHeaders() }
        ),
      ]);

    // Parse responses safely
    const successData: ApiHistoryResponse<SuccessRateItem> = successRes.ok
      ? await successRes.json()
      : { history: [], pagination: { total: 0, offset: 0, limit: 0 } };

    const rewardsData: ApiHistoryResponse<BlockRewardItem> = rewardsRes.ok
      ? await rewardsRes.json()
      : { history: [], pagination: { total: 0, offset: 0, limit: 0 } };

    const stakeData: ApiHistoryResponse<StakeHistoryItem> = stakeRes.ok
      ? await stakeRes.json()
      : { history: [], pagination: { total: 0, offset: 0, limit: 0 } };

    const stakeAccountsData: ApiHistoryResponse<StakeAccountsItem> =
      stakeAccountsRes.ok
        ? await stakeAccountsRes.json()
        : { history: [], pagination: { total: 0, offset: 0, limit: 0 } };

    // STEP 3: Merge and Format the Data
    // We Map over success history as the base since it usually dictates the epochs we care about
    const performanceHistory = successData.history.map((item) => {
      // Find matching data from other arrays by epoch
      const rewardItem = rewardsData.history.find(
        (r) => r.epoch === item.epoch
      );
      const stakeItem = stakeData.history.find((s) => s.epoch === item.epoch);
      const accountItem = stakeAccountsData.history.find(
        (a) => a.epoch === item.epoch
      );

      // Calculate Skip Rate (1 - Success Rate)
      const skipRate =
        item.successRate !== undefined ? 1 - item.successRate : 0;

      return {
        epoch: item.epoch,
        // New Data Points
        activeStake: stakeItem ? stakeItem.activatedStake : 0,
        activeStakeAccounts: accountItem ? accountItem.stakeAccounts : 0,
        // Existing Data Points
        skipRate: skipRate,
        credits: rewardItem ? rewardItem.blocks : 0,
        apy: 0, // Placeholder
      };
    });

    // STEP 4: Calculate Aggregates
    const totalSkipRate = performanceHistory.reduce(
      (acc, curr) => acc + curr.skipRate,
      0
    );
    const averageSkipRate =
      performanceHistory.length > 0
        ? totalSkipRate / performanceHistory.length
        : 0;

    const uptime =
      performanceHistory.length > 0 ? (1 - averageSkipRate) * 100 : 0;

    return {
      performanceHistory,
      uptime,
      averageApy: 0, // Still returning 0 to satisfy interface
    };
  } catch (error) {
    console.warn(`Error fetching performance for ${validatorAddress}:`, error);
    return { performanceHistory: [], uptime: 0, averageApy: 0 };
  }
}

export async function GET() {
  try {
    console.log("Fetching validators from Solana network...");

    // Get RPC endpoint from environment configuration
    const rpcEndpoint = getRPCEndpoint();
    const connection = new Connection(rpcEndpoint, "confirmed");
    // Fetch current epoch info
    const currentEpochInfo = await fetchCurrentEpochInfo();

    // Fetch validator metadata from Solana Beach in parallel
    const [voteAccounts, beachValidators] = await Promise.all([
      connection.getVoteAccounts(),
      fetchSolanaBeachValidators(),
    ]);

    // Combine current and delinquent validators
    const allValidators = [
      ...voteAccounts.current.map((account) => ({
        ...account,
        status: "active" as const,
      })),
      ...voteAccounts.delinquent.map((account) => ({
        ...account,
        status: "delinquent" as const,
      })),
    ];

    // Transform to our validator format with enhanced metadata
    const validators = await Promise.all(
      allValidators.slice(0, 90).map(async (account) => {
        // Limit to 100 for performance
        // Get metadata from Solana Beach or fallback
        // NEW: Fetch epoch details for this validator
        // const epochHistory = await fetchEpochDetails(account.votePubkey, 10);
        const validatorResData = await axios.get<SolanaBeachValidatorResponse>(
          `${ENV.BASE_URL}/api/validator/` + account.votePubkey
        );

        const beachData = beachValidators.get(account.votePubkey);
        const fallbackData = VALIDATOR_NAMES[account.votePubkey];
        const remData = validatorResData.data.response;
        const validatorInfo = {
          name:
            beachData?.name ||
            fallbackData?.name ||
            `Validator ${account.votePubkey.slice(0, 8)}...`,
          description: remData?.details || "Solana validator node",
          website: remData?.website,
          avatar: remData?.iconUrl,
          location: remData.continent || "Unknown",
          country: remData.country,
          keybaseUsername: remData.website,
          twitterUsername: beachData?.name,
        };

        const apy = calculateAPY(account.epochCredits);
        const skipRate = calculateSkipRate(account.epochCredits);
        const stakeAmount = account.activatedStake / 1000000000; // Convert lamports to SOL

        // Build current epoch details
        //let currentEpoch: EpochDetails | undefined;
        //if (currentEpochInfo) {
        //  currentEpoch = {
        //    epoch: currentEpochInfo.epoch,
        //    startSlot:
        //      currentEpochInfo.absoluteSlot - currentEpochInfo.slotIndex,
        //    endSlot:
        //      currentEpochInfo.absoluteSlot +
        //      (currentEpochInfo.slotsInEpoch - currentEpochInfo.slotIndex),
        //    totalTransactions: currentEpochInfo.transactionCount,
        //    blockRewards: {
        //      totalBlocks: epochHistory[0]?.blockRewards.totalBlocks || 0,
        //      totalFees: epochHistory[0]?.blockRewards.totalFees || 0,
        //    },
        //  };
        //}
        // Get performance history for top validators
        let performanceData: {
          performanceHistory: Array<{
            epoch: number;
            apy: number;
            skipRate: number;
            credits: number;
          }>;
          uptime: number;
          averageApy: number;
        } = { performanceHistory: [], uptime: 0, averageApy: apy };

        if (stakeAmount > 100000) {
          // Only fetch for validators with >1M SOL stake
          try {
            performanceData = await fetchValidatorPerformance2(
              account.votePubkey
            );
          } catch (error) {
            console.warn(
              `Failed to fetch performance for ${account.votePubkey}`
            );
          }
        }

        return {
          address: account.votePubkey,
          name: validatorInfo.name,
          commission: account.commission,
          stake: stakeAmount,
          apy:
            performanceData.averageApy > 0 ? performanceData.averageApy : apy,
          delegatedStake: stakeAmount,
          skipRate: skipRate,
          dataCenter: validatorInfo.location || "Unknown",
          website: validatorInfo.website,
          description: validatorInfo.description,
          avatar: validatorInfo.avatar || "",
          status: account.status,
          epochCredits: account.epochCredits
            .map(([epoch, credits, prevCredits]) => credits)
            .slice(-10), // Last 10 epochs
          votingPubkey: account.votePubkey,
          activatedStake: account.activatedStake,
          lastVote: account.lastVote,
          rootSlot: 0,
          // Enhanced metadata
          country: validatorInfo.country,
          keybaseUsername: validatorInfo.keybaseUsername,
          twitterUsername: validatorInfo.twitterUsername,
          uptime: performanceData.uptime,
          performanceHistory: performanceData.performanceHistory,
          //currentEpoch: currentEpoch,
          //epochHistory: epochHistory,
        };
      })
    );

    // Sort by stake amount (descending) by default
    validators.sort((a, b) => b.stake - a.stake);

    return NextResponse.json({
      validators,
      currentEpochInfo,
    });
  } catch (error) {
    console.error("Error fetching validators:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch validators from Solana network",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
