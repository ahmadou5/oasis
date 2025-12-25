import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

export interface StakeAccountDetails {
  address: string;
  found: boolean;
  network: "mainnet-beta" | "testnet" | "devnet";
  
  // Basic Info
  balance?: number;
  balanceSol?: number;
  rentExemptReserve?: number;
  
  // Stake Account State
  state?: "uninitialized" | "initialized" | "delegated" | "inactive";
  
  // Authorities
  staker?: string;
  withdrawer?: string;
  
  // Delegation Info
  delegation?: {
    voter: string;
    stake: number;
    stakeSol: number;
    activationEpoch: number;
    deactivationEpoch: number;
    warmupCooldownRate: number;
  };
  
  // Validator Info (if delegated)
  validator?: {
    identity?: string;
    name?: string;
    commission?: number;
    isActive?: boolean;
    totalStake?: number;
    totalStakeSol?: number;
    apy?: number;
  };
  
  // Rewards & Performance
  rewards?: {
    total: number;
    totalSol: number;
    epoch: number;
    amount: number;
    amountSol: number;
    postBalance: number;
    postBalanceSol: number;
    commission?: number;
  }[];
  
  // Lockup Info
  lockup?: {
    unixTimestamp: number;
    epoch: number;
    custodian: string;
  };
  
  // Transaction History
  recentTransactions?: Array<{
    signature: string;
    slot: number;
    blockTime?: number;
    type: "create" | "delegate" | "deactivate" | "withdraw" | "split" | "merge";
    amount?: number;
    amountSol?: number;
  }>;
}

const STAKE_PROGRAM = "Stake11111111111111111111111111111111111111";

function lamportsToSol(lamports: number) {
  return lamports / 1_000_000_000;
}

export async function fetchStakeDetails(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<StakeAccountDetails> {
  const network = params.network ?? "mainnet-beta";
  const endpoint = params.rpcEndpoint ?? getRPCEndpoint(network);
  const connection = new Connection(endpoint, { commitment: "confirmed" });

  let stakeKey: PublicKey;
  try {
    stakeKey = new PublicKey(params.address);
  } catch {
    return {
      address: params.address,
      found: false,
      network,
    };
  }

  try {
    // Get parsed stake account info
    const accountInfo = await connection.getParsedAccountInfo(stakeKey, "confirmed");
    const account = accountInfo.value;

    if (!account) {
      return {
        address: stakeKey.toBase58(),
        found: false,
        network,
      };
    }

    // Verify this is a stake account
    if (account.owner.toBase58() !== STAKE_PROGRAM) {
      return {
        address: stakeKey.toBase58(),
        found: false,
        network,
      };
    }

    const parsedData = account.data as any;
    const stakeInfo = parsedData?.parsed;

    if (!stakeInfo) {
      return {
        address: stakeKey.toBase58(),
        found: false,
        network,
      };
    }

    const info = stakeInfo.info;
    const state = stakeInfo.type;
    const balance = account.lamports;
    const balanceSol = lamportsToSol(balance);

    const baseDetails: StakeAccountDetails = {
      address: stakeKey.toBase58(),
      found: true,
      network,
      balance,
      balanceSol,
      state,
    };

    // Parse meta information
    const meta = info?.meta;
    if (meta) {
      baseDetails.rentExemptReserve = meta.rentExemptReserve;
      baseDetails.staker = meta.authorized?.staker;
      baseDetails.withdrawer = meta.authorized?.withdrawer;
      
      if (meta.lockup) {
        baseDetails.lockup = {
          unixTimestamp: meta.lockup.unixTimestamp,
          epoch: meta.lockup.epoch,
          custodian: meta.lockup.custodian,
        };
      }
    }

    // Parse delegation information
    const stake = info?.stake;
    if (stake?.delegation) {
      const delegation = stake.delegation;
      baseDetails.delegation = {
        voter: delegation.voter,
        stake: Number(delegation.stake),
        stakeSol: lamportsToSol(Number(delegation.stake)),
        activationEpoch: delegation.activationEpoch,
        deactivationEpoch: delegation.deactivationEpoch,
        warmupCooldownRate: delegation.warmupCooldownRate,
      };

      // Get validator information
      try {
        const validatorInfo = await getValidatorInfo(connection, delegation.voter);
        if (validatorInfo) {
          baseDetails.validator = validatorInfo;
        }
      } catch (error) {
        console.warn("Failed to fetch validator info:", error);
      }
    }

    // Get rewards history
    try {
      const rewards = await getStakeRewards(connection, stakeKey);
      baseDetails.rewards = rewards;
    } catch (error) {
      console.warn("Failed to fetch rewards:", error);
    }

    // Get recent transactions
    try {
      const transactions = await getStakeTransactions(connection, stakeKey);
      baseDetails.recentTransactions = transactions;
    } catch (error) {
      console.warn("Failed to fetch transactions:", error);
    }

    return baseDetails;

  } catch (error) {
    console.error("Error fetching stake details:", error);
    return {
      address: stakeKey.toBase58(),
      found: false,
      network,
    };
  }
}

async function getValidatorInfo(
  connection: Connection,
  voteAddress: string
): Promise<StakeAccountDetails["validator"] | null> {
  try {
    const voteAccounts = await connection.getVoteAccounts();
    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent];
    
    const validator = allValidators.find(v => v.votePubkey === voteAddress);
    
    if (!validator) return null;

    return {
      identity: validator.nodePubkey,
      commission: validator.commission,
      isActive: voteAccounts.current.some(v => v.votePubkey === voteAddress),
      totalStake: Number(validator.activatedStake),
      totalStakeSol: lamportsToSol(Number(validator.activatedStake)),
      apy: calculateValidatorAPY(validator.commission), // Simplified APY calculation
    };

  } catch (error) {
    console.warn("Error fetching validator info:", error);
    return null;
  }
}

function calculateValidatorAPY(commission: number): number {
  // Simplified APY calculation - in production you'd use historical data
  const baseAPY = 6.5; // Approximate Solana network APY
  const commissionRate = commission / 100;
  return baseAPY * (1 - commissionRate);
}

async function getStakeRewards(
  connection: Connection,
  stakeAccount: PublicKey
): Promise<StakeAccountDetails["rewards"]> {
  try {
    const rewards = await connection.getInflationReward([stakeAccount], undefined);
    
    if (!rewards || !rewards[0]) return [];

    const rewardInfo = rewards[0];
    
    return [{
      total: rewardInfo.amount,
      totalSol: lamportsToSol(rewardInfo.amount),
      epoch: rewardInfo.epoch,
      amount: rewardInfo.amount,
      amountSol: lamportsToSol(rewardInfo.amount),
      postBalance: rewardInfo.postBalance,
      postBalanceSol: lamportsToSol(rewardInfo.postBalance),
      commission: rewardInfo.commission,
    }];

  } catch (error) {
    console.warn("Error fetching stake rewards:", error);
    return [];
  }
}

async function getStakeTransactions(
  connection: Connection,
  stakeAccount: PublicKey
): Promise<StakeAccountDetails["recentTransactions"]> {
  try {
    const signatures = await connection.getSignaturesForAddress(stakeAccount, {
      limit: 20,
    });

    const transactions: NonNullable<StakeAccountDetails["recentTransactions"]> = [];

    for (const sig of signatures.slice(0, 10)) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        if (tx?.meta) {
          // Simplified transaction type detection
          const instructions = tx.transaction.message.compiledInstructions;
          let type: StakeAccountDetails["recentTransactions"][0]["type"] = "create";
          
          // This is a simplified parser - would need more sophisticated logic
          if (instructions.some(ix => ix.data.length > 0)) {
            type = "delegate";
          }

          transactions.push({
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime || undefined,
            type,
            amount: tx.meta.postBalances[0] - tx.meta.preBalances[0],
            amountSol: lamportsToSol(Math.abs(tx.meta.postBalances[0] - tx.meta.preBalances[0])),
          });
        }
      } catch (error) {
        console.warn("Failed to parse transaction:", error);
      }
    }

    return transactions;

  } catch (error) {
    console.warn("Error fetching stake transactions:", error);
    return [];
  }
}