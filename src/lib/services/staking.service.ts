// lib/services/SolanaStakingService.ts
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  sendAndConfirmTransaction,
  StakeProgram,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

interface IAuthorized {
  staker: PublicKey;
  withdrawer: PublicKey;
}

/**
 * Defines the lockup conditions for a stake account.
 */
interface ILockup {
  unixTimestamp: number;
  epoch: number;
  custodian: PublicKey;
}

/**
 * Represents the complete meta object for a stake account.
 */
interface IStakeAccountMeta {
  authorized: IAuthorized;
  lockup: ILockup;
}

// Types for staking operations
export interface StakeAccountInfo {
  address: PublicKey;
  balance: number; // in SOL
  status:
    | "activating"
    | "active"
    | "deactivating"
    | "inactive"
    | "uninitialized"
    | "unknown";
  delegatedValidator?: PublicKey;

  activationEpoch?: number;
  deactivationEpoch?: number;
  rentExemptReserve: number;
  creditsObserved: number;
  totalBalance: number;
  meta: IStakeAccountMeta;
  lastUpdateEpoch: number;
}

export interface StakeTransactionResult {
  success: boolean;
  signature?: string;
  stakeAccount?: PublicKey;
  message: string;
  error?: string;
}

export interface ValidatorInfo {
  votePubkey: string;
  name: string;
  commission: number;
  netApy: number;
  iconUrl: string;
}

export interface StakingFees {
  stakeAccountRent: number; // ~0.00228288 SOL
  transactionFee: number; // ~0.000005 SOL
  total: number;
}

export class SolanaStakingService {
  private connection: Connection;
  private commitment = "confirmed" as const;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Calculate the minimum balance required for staking
   */
  async getMinimumStakeBalance(): Promise<number> {
    try {
      const rentExemption =
        await this.connection.getMinimumBalanceForRentExemption(
          StakeProgram.space
        );
      return rentExemption / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting minimum stake balance:", error);
      return 0.00228288; // Fallback to known value
    }
  }

  /**
   * Calculate all fees associated with staking
   */
  async calculateStakingFees(): Promise<StakingFees> {
    try {
      const stakeAccountRent = await this.getMinimumStakeBalance();

      // Get recent blockhash to estimate fees
      const { blockhash } = await this.connection.getLatestBlockhash();

      // Create a dummy transaction to estimate fees
      const dummyKeypair = Keypair.generate();
      const dummyTransaction = new Transaction();

      // Add typical staking instructions
      dummyTransaction.add(
        SystemProgram.createAccount({
          fromPubkey: dummyKeypair.publicKey,
          newAccountPubkey: dummyKeypair.publicKey,
          lamports: stakeAccountRent * LAMPORTS_PER_SOL,
          space: StakeProgram.space,
          programId: StakeProgram.programId,
        }),
        StakeProgram.initialize({
          stakePubkey: dummyKeypair.publicKey,
          authorized: {
            staker: dummyKeypair.publicKey,
            withdrawer: dummyKeypair.publicKey,
          },
        })
      );

      dummyTransaction.recentBlockhash = blockhash;
      dummyTransaction.feePayer = dummyKeypair.publicKey;

      const feeEstimate = await this.connection.getFeeForMessage(
        dummyTransaction.compileMessage()
      );

      const transactionFee = (feeEstimate?.value || 5000) / LAMPORTS_PER_SOL;

      return {
        stakeAccountRent,
        transactionFee,
        total: stakeAccountRent + transactionFee,
      };
    } catch (error) {
      console.error("Error calculating fees:", error);
      return {
        stakeAccountRent: 0.00228288,
        transactionFee: 0.000005,
        total: 0.002287885,
      };
    }
  }

  /**
   * Validate staking parameters before creating transaction
   */
  async validateStakeParameters(
    userPublicKey: PublicKey,
    stakeAmount: number,
    validatorVoteAccount: PublicKey
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Check user balance
      const balance = await this.connection.getBalance(userPublicKey);
      const balanceSOL = balance / LAMPORTS_PER_SOL;

      // Get minimum requirements
      const fees = await this.calculateStakingFees();
      const totalRequired = stakeAmount + fees.total;

      if (balanceSOL < totalRequired) {
        return {
          isValid: false,
          error: `Insufficient balance. Required: ${totalRequired.toFixed(
            6
          )} SOL, Available: ${balanceSOL.toFixed(6)} SOL`,
        };
      }

      // Check minimum stake amount
      if (stakeAmount < fees.stakeAccountRent) {
        return {
          isValid: false,
          error: `Stake amount too low. Minimum: ${fees.stakeAccountRent.toFixed(
            8
          )} SOL`,
        };
      }

      // Validate validator vote account
      try {
        const validatorInfo = await this.connection.getAccountInfo(
          validatorVoteAccount
        );
        if (!validatorInfo) {
          return {
            isValid: false,
            error: "Invalid validator vote account",
          };
        }
      } catch {
        return {
          isValid: false,
          error: "Unable to verify validator",
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: "Unable to validate stake parameters",
      };
    }
  }

  /**
   * Create a stake account and delegate to validator in a single transaction
   */
  async createStakeAccount(
    userKeypair: Keypair,
    stakeAmount: number,
    validatorVoteAccount: PublicKey
  ): Promise<StakeTransactionResult> {
    try {
      // Validate parameters
      const validation = await this.validateStakeParameters(
        userKeypair.publicKey,
        stakeAmount,
        validatorVoteAccount
      );

      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error || "Validation failed",
        };
      }

      // Generate new stake account
      const stakeAccount = Keypair.generate();
      const lamports = Math.floor(stakeAmount * LAMPORTS_PER_SOL);

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash(this.commitment);

      // Build transaction instructions
      const instructions: TransactionInstruction[] = [];

      // Add compute budget instruction to ensure transaction goes through
      instructions.push(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 1000, // 0.001 SOL per compute unit
        })
      );

      // 1. Create stake account
      instructions.push(
        SystemProgram.createAccount({
          fromPubkey: userKeypair.publicKey,
          newAccountPubkey: stakeAccount.publicKey,
          lamports,
          space: StakeProgram.space,
          programId: StakeProgram.programId,
        })
      );

      // 2. Initialize stake account
      instructions.push(
        StakeProgram.initialize({
          stakePubkey: stakeAccount.publicKey,
          authorized: {
            staker: userKeypair.publicKey,
            withdrawer: userKeypair.publicKey,
          },
          lockup: {
            unixTimestamp: 0,
            epoch: 0,
            custodian: userKeypair.publicKey,
          },
        })
      );

      try {
        const delegateResult = StakeProgram.delegate({
          stakePubkey: stakeAccount.publicKey,
          authorizedPubkey: userKeypair.publicKey,
          votePubkey: validatorVoteAccount,
        });

        // Handle both Transaction and TransactionInstruction returns
        if (
          "instructions" in delegateResult &&
          Array.isArray(delegateResult.instructions)
        ) {
          // It's a Transaction object
          const delegateInstruction = delegateResult.instructions[0];

          // Ensure the program ID is correct
          if (delegateInstruction.programId.equals(StakeProgram.programId)) {
            instructions.push(delegateInstruction);
          } else {
            // Fix the program ID if it's incorrect
            const correctedInstruction = new TransactionInstruction({
              keys: delegateInstruction.keys,
              programId: StakeProgram.programId,
              data: delegateInstruction.data,
            });
            instructions.push(correctedInstruction);
          }
        } else {
          // It's a TransactionInstruction
          const delegateInstruction =
            delegateResult as unknown as TransactionInstruction;

          // Ensure the program ID is correct
          if (delegateInstruction.programId.equals(StakeProgram.programId)) {
            instructions.push(delegateInstruction);
          } else {
            // Fix the program ID if it's incorrect
            const correctedInstruction = new TransactionInstruction({
              keys: delegateInstruction.keys,
              programId: StakeProgram.programId,
              data: delegateInstruction.data,
            });
            instructions.push(correctedInstruction);
          }
        }
      } catch (error) {
        console.error("Error creating delegate instruction:", error);
        return {
          success: false,
          message: "Failed to create delegate instruction",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }

      // Debug: Log all instructions and their program IDs
      console.log("=== INSTRUCTION DEBUG ===");
      instructions.forEach((instruction, index) => {
        console.log(`Instruction ${index}:`, {
          programId: instruction.programId.toString(),
          isStakeProgram: instruction.programId.equals(StakeProgram.programId),
          keys: instruction.keys.length,
          dataLength: instruction.data.length,
        });
      });

      // Create transaction message
      const messageV0 = new TransactionMessage({
        payerKey: userKeypair.publicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      // Create versioned transaction
      const transaction = new VersionedTransaction(messageV0);

      // Sign transaction with both keypairs (user and stake account)
      transaction.sign([userKeypair, stakeAccount]);

      // Simulate transaction first
      const simulationResult = await this.connection.simulateTransaction(
        transaction,
        {
          sigVerify: false, // Skip signature verification during simulation
          commitment: this.commitment,
        }
      );

      if (simulationResult.value.err) {
        console.error(
          "Transaction simulation failed:",
          simulationResult.value.err
        );
        return {
          success: false,
          message: "Transaction simulation failed. Please try again.",
          error: JSON.stringify(simulationResult.value.err),
        };
      }

      // Send and confirm transaction
      const signature = await this.connection.sendTransaction(transaction, {
        skipPreflight: false,
        preflightCommitment: this.commitment,
        maxRetries: 3,
      });

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        this.commitment
      );

      if (confirmation.value.err) {
        console.error("Transaction failed:", confirmation.value.err);
        return {
          success: false,
          message: "Transaction failed on-chain",
          error: JSON.stringify(confirmation.value.err),
        };
      }

      return {
        success: true,
        signature,
        stakeAccount: stakeAccount.publicKey,
        message: `✅Successfully staked ${stakeAmount} SOL to validator`,
      };
    } catch (error) {
      console.error("Staking error:", error);

      let errorMessage = "Failed to create stake account";
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for staking transaction";
        } else if (error.message.includes("blockhash")) {
          errorMessage = "Transaction expired. Please try again";
        } else if (error.message.includes("simulation failed")) {
          errorMessage = "Transaction would fail. Please check your inputs";
        } else if (error.message.includes("IncorrectProgramId")) {
          errorMessage = "Invalid program ID in transaction";
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all stake accounts for a user
   */
  async getUserStakeAccounts(
    userPublicKey: PublicKey
  ): Promise<StakeAccountInfo[]> {
    try {
      // Get current epoch once for all accounts
      const currentEpoch = await this.getCurrentEpoch();

      const stakeAccounts = await this.connection.getParsedProgramAccounts(
        StakeProgram.programId,
        {
          filters: [
            {
              memcmp: {
                offset: 12, // Offset for authorized staker
                bytes: userPublicKey.toBase58(),
              },
            },
          ],
          commitment: "confirmed", // Ensure we get confirmed data
        }
      );

      const stakeAccountInfos: StakeAccountInfo[] = [];

      for (const account of stakeAccounts) {
        try {
          const accountInfo = account.account;
          if (!("parsed" in accountInfo.data)) {
            // If data is not parsed, skip this account
            continue;
          }
          const parsedData = accountInfo.data as ParsedAccountData;

          const stakeData = parsedData?.parsed.info;
          const meta = stakeData.meta;
          const stake = stakeData.stake;

          // Initialize default values
          let status: StakeAccountInfo["status"] = "inactive";
          let delegatedValidator: PublicKey | undefined;
          let activationEpoch: number | undefined;
          let deactivationEpoch: number | undefined;
          let creditsObserved = 0;

          // Calculate actual staked balance (excluding rent reserve)
          const totalBalance = accountInfo.lamports / LAMPORTS_PER_SOL;
          const rentReserve = (meta?.rentExemptReserve || 0) / LAMPORTS_PER_SOL;
          const balance = Math.max(0, totalBalance - rentReserve);

          // Process stake delegation info if available
          if (stake?.delegation) {
            try {
              const delegation = stake.delegation;

              // Safely extract delegation data
              delegatedValidator = new PublicKey(delegation.voter);
              activationEpoch = this.parseEpoch(delegation.activationEpoch);
              deactivationEpoch = this.parseEpoch(delegation.deactivationEpoch);
              creditsObserved = parseInt(delegation.creditsObserved || "0");

              // Determine accurate status based on delegation state and epochs
              status = this.determineStakeStatus({
                activationEpoch,
                deactivationEpoch,
                currentEpoch,
                hasStake: balance > 0,
                delegation,
              });
            } catch (delegationError) {
              console.warn(
                `Error processing delegation for ${account.pubkey.toString()}:`,
                delegationError
              );
              // Continue with default values
            }
          } else {
            // No delegation means either uninitialized or inactive
            status = meta ? "inactive" : "uninitialized";
          }

          // Validate we have required meta data
          if (!meta) {
            console.warn(
              `Missing meta data for stake account ${account.pubkey.toString()}`
            );
            continue;
          }

          stakeAccountInfos.push({
            address: account.pubkey,
            balance,
            status,
            delegatedValidator,
            activationEpoch,
            deactivationEpoch,
            rentExemptReserve: rentReserve,
            creditsObserved,
            // Additional useful fields
            totalBalance, // Include total balance for reference
            meta: {
              authorized: {
                staker: new PublicKey(meta.authorized?.staker || userPublicKey),
                withdrawer: new PublicKey(
                  meta.authorized?.withdrawer || userPublicKey
                ),
              },
              lockup: {
                unixTimestamp: meta.lockup?.unixTimestamp || 0,
                epoch: meta.lockup?.epoch || 0,
                custodian: new PublicKey(
                  meta.lockup?.custodian || "11111111111111111111111111111112"
                ),
              },
            },
            lastUpdateEpoch: currentEpoch,
          });
        } catch (accountError) {
          console.error(
            `Error processing stake account ${account.pubkey?.toString()}:`,
            accountError
          );
          // Continue processing other accounts
          continue;
        }
      }

      // Sort accounts by balance (highest first) for better UX
      return stakeAccountInfos.sort((a, b) => b.balance - a.balance);
    } catch (error) {
      console.error("Error fetching stake accounts:", error);
      return [];
    }
  }

  // Helper method to safely parse epoch values
  private parseEpoch(epochValue: any): number | undefined {
    if (epochValue === null || epochValue === undefined) {
      return undefined;
    }

    if (typeof epochValue === "string") {
      // Handle string epoch values
      if (epochValue === "18446744073709551615") {
        // This is the max u64 value, means never deactivating
        return Number.MAX_SAFE_INTEGER;
      }
      const parsed = parseInt(epochValue);
      return isNaN(parsed) ? undefined : parsed;
    }

    if (typeof epochValue === "number") {
      return epochValue;
    }

    return undefined;
  }

  // Enhanced status determination method
  private determineStakeStatus({
    activationEpoch,
    deactivationEpoch,
    currentEpoch,
    hasStake,
    delegation,
  }: {
    activationEpoch?: number;
    deactivationEpoch?: number;
    currentEpoch: number;
    hasStake: boolean;
    delegation: any;
  }): StakeAccountInfo["status"] {
    // No stake means inactive
    if (!hasStake) {
      return "inactive";
    }

    // No activation epoch means not properly initialized
    if (activationEpoch === undefined) {
      return "uninitialized";
    }

    // Check if stake is still warming up (activating)
    if (currentEpoch < activationEpoch) {
      return "activating";
    }

    // Check if deactivation has been requested
    if (
      deactivationEpoch !== undefined &&
      deactivationEpoch !== Number.MAX_SAFE_INTEGER
    ) {
      // Deactivation requested
      if (currentEpoch >= deactivationEpoch) {
        // Check if cooldown period is complete
        const cooldownEpochs = this.getCooldownEpochs(delegation);
        if (currentEpoch >= deactivationEpoch + cooldownEpochs) {
          return "inactive"; // Ready to withdraw
        } else {
          return "deactivating"; // Still cooling down
        }
      }
    }

    // Stake is active and earning rewards
    return "active";
  }

  // Helper to calculate cooldown epochs (approximate)
  private getCooldownEpochs(delegation: any): number {
    // Solana uses a warmup/cooldown mechanism
    // This is a simplified calculation - actual implementation would need
    // to consider the validator's total stake and warmup/cooldown rate
    const warmupCooldownRate = parseFloat(
      delegation?.warmupCooldownRate || "0.25"
    );

    // Minimum 1 epoch cooldown, typically 2-3 epochs
    return Math.max(1, Math.ceil(1 / warmupCooldownRate));
  }

  // Helper method to get current epoch (cache for performance)
  private epochCache: { epoch: number; timestamp: number } | null = null;
  private readonly EPOCH_CACHE_DURATION = 60000; // 1 minute cache

  private async getCurrentEpoch(): Promise<number> {
    const now = Date.now();

    // Use cached epoch if recent
    if (
      this.epochCache &&
      now - this.epochCache.timestamp < this.EPOCH_CACHE_DURATION
    ) {
      return this.epochCache.epoch;
    }

    try {
      const epochInfo = await this.connection.getEpochInfo();
      this.epochCache = {
        epoch: epochInfo.epoch,
        timestamp: now,
      };
      return epochInfo.epoch;
    } catch (error) {
      console.error("Error fetching current epoch:", error);

      // Return cached value if available, otherwise estimate
      if (this.epochCache) {
        return this.epochCache.epoch;
      }

      // Fallback: estimate current epoch (roughly 2-3 days per epoch)
      const slotsPerEpoch = 432000; // Approximate
      const msPerSlot = 400; // Approximate
      const epochDuration = slotsPerEpoch * msPerSlot;
      const estimatedEpoch = Math.floor(now / epochDuration);

      return estimatedEpoch;
    }
  }

  // Additional helper method to check if account can be withdrawn
  public canWithdraw(stakeAccount: StakeAccountInfo): boolean {
    return stakeAccount.status === "inactive" && stakeAccount.balance > 0;
  }

  // Helper method to estimate time until stake becomes active/inactive
  public estimateStatusChangeTime(stakeAccount: StakeAccountInfo): {
    timeUntilChange?: number;
    nextStatus?: StakeAccountInfo["status"];
    message: string;
  } {
    const currentEpoch = this.epochCache?.epoch || 0;
    const epochDurationMs = 2.5 * 24 * 60 * 60 * 1000; // ~2.5 days per epoch

    switch (stakeAccount.status) {
      case "activating":
        if (stakeAccount.activationEpoch) {
          const epochsRemaining = stakeAccount.activationEpoch - currentEpoch;
          return {
            timeUntilChange: epochsRemaining * epochDurationMs,
            nextStatus: "active",
            message: `Will become active in ~${epochsRemaining} epochs (${Math.ceil(
              epochsRemaining * 2.5
            )} days)`,
          };
        }
        break;

      case "deactivating":
        if (stakeAccount.deactivationEpoch) {
          const cooldownEpochs = 2; // Approximate
          const totalEpochsRemaining =
            stakeAccount.deactivationEpoch + cooldownEpochs - currentEpoch;
          return {
            timeUntilChange: totalEpochsRemaining * epochDurationMs,
            nextStatus: "inactive",
            message: `Will be withdrawable in ~${totalEpochsRemaining} epochs (${Math.ceil(
              totalEpochsRemaining * 2.5
            )} days)`,
          };
        }
        break;

      case "active":
        return {
          message: "Stake is active and earning rewards",
        };

      case "inactive":
        return {
          message:
            stakeAccount.balance > 0 ? "Ready to withdraw" : "Account is empty",
        };
    }

    return {
      message: "Status timing unavailable",
    };
  }

  /**
   * Deactivate (undelegate) a stake account
   */
  async deactivateStakeAccount(
    userKeypair: Keypair,
    stakeAccountPubkey: PublicKey
  ): Promise<StakeTransactionResult> {
    try {
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash(this.commitment);

      // Create deactivate instruction
      const transaction = StakeProgram.deactivate({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: userKeypair.publicKey,
      });

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userKeypair.publicKey;

      // Sign and send
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [userKeypair],
        { commitment: this.commitment }
      );

      return {
        success: true,
        signature,
        message:
          "Successfully initiated unstaking. Funds will be available after the current epoch ends.",
      };
    } catch (error) {
      console.error("Deactivation error:", error);
      return {
        success: false,
        message: "Failed to deactivate stake account",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Withdraw from a deactivated stake account
   */
  async withdrawStakeAccount(
    userKeypair: Keypair,
    stakeAccountPubkey: PublicKey,
    amount?: number // If not provided, withdraws all available
  ): Promise<StakeTransactionResult> {
    try {
      // Get stake account info
      const stakeAccountInfo = await this.connection.getAccountInfo(
        stakeAccountPubkey
      );
      if (!stakeAccountInfo) {
        return {
          success: false,
          message: "Stake account not found",
        };
      }

      const withdrawAmount = amount
        ? Math.floor(amount * LAMPORTS_PER_SOL)
        : stakeAccountInfo.lamports;

      // Get latest blockhash
      const { blockhash } = await this.connection.getLatestBlockhash(
        this.commitment
      );

      // Create withdraw instruction
      const transaction = StakeProgram.withdraw({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: userKeypair.publicKey,
        toPubkey: userKeypair.publicKey,
        lamports: withdrawAmount,
      });
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userKeypair.publicKey;

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [userKeypair],
        { commitment: this.commitment }
      );

      return {
        success: true,
        signature,
        message: `Successfully withdrew ${
          withdrawAmount / LAMPORTS_PER_SOL
        } SOL`,
      };
    } catch (error) {
      console.error("Withdrawal error:", error);
      return {
        success: false,
        message: "Failed to withdraw from stake account",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get current epoch information
   */

  /**
   * Get epoch information including timing
   */
  async getEpochInfo() {
    try {
      const epochInfo = await this.connection.getEpochInfo();
      const slotsInEpoch = epochInfo.slotsInEpoch;
      const slotIndex = epochInfo.slotIndex;
      const slotsRemaining = slotsInEpoch - slotIndex;

      // Approximate time calculation (400ms per slot average)
      const approximateTimeRemaining = slotsRemaining * 0.4; // seconds

      return {
        epoch: epochInfo.epoch,
        slotIndex,
        slotsInEpoch,
        slotsRemaining,
        approximateTimeRemaining: Math.floor(approximateTimeRemaining / 3600), // hours
        percentComplete: (slotIndex / slotsInEpoch) * 100,
      };
    } catch (error) {
      console.error("Error getting epoch info:", error);
      return null;
    }
  }

  /**
   * Calculate estimated staking rewards
   */
  calculateEstimatedRewards(
    stakeAmount: number,
    validatorAPY: number,
    stakingPeriodDays: number
  ): {
    dailyRewards: number;
    totalRewards: number;
    finalAmount: number;
  } {
    const dailyRate = validatorAPY / 100 / 365;
    const dailyRewards = stakeAmount * dailyRate;
    const totalRewards = dailyRewards * stakingPeriodDays;

    return {
      dailyRewards,
      totalRewards,
      finalAmount: stakeAmount + totalRewards,
    };
  }
}

// Helper function to create service instance
export const createStakingService = (connection: Connection) => {
  return new SolanaStakingService(connection);
};

// Export utility functions
export const formatStakeAmount = (amount: number): string => {
  return amount.toFixed(8);
};

export const formatStakeStatus = (
  status: StakeAccountInfo["status"]
): string => {
  switch (status) {
    case "active":
      return "Active & Earning";
    case "activating":
      return "Activating";
    case "deactivating":
      return "Unstaking";
    case "inactive":
      return "Inactive";
    default:
      return "Unknown";
  }
};
