import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
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
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

const parseEpoch = (epochValue: any): number | undefined => {
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
};

// Enhanced status determination method
const determineStakeStatus = ({
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
}): StakeAccountInfo["status"] => {
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
      const cooldownEpochs = getCooldownEpochs(delegation);
      if (currentEpoch >= deactivationEpoch + cooldownEpochs) {
        return "inactive"; // Ready to withdraw
      } else {
        return "deactivating"; // Still cooling down
      }
    }
  }

  // Stake is active and earning rewards
  return "active";
};

const getCooldownEpochs = (delegation: any): number => {
  // Solana uses a warmup/cooldown mechanism
  // This is a simplified calculation - actual implementation would need
  // to consider the validator's total stake and warmup/cooldown rate
  const warmupCooldownRate = parseFloat(
    delegation?.warmupCooldownRate || "0.25"
  );

  // Minimum 1 epoch cooldown, typically 2-3 epochs
  return Math.max(1, Math.ceil(1 / warmupCooldownRate));
};

export const getUserStakeAccounts = async (
  userPublicKey: PublicKey,
  connection: Connection
): Promise<StakeAccountInfo[]> => {
  try {
    // Get current epoch once for all accounts
    const epochInfo = await connection.getEpochInfo();
    const currentEpoch = epochInfo.epoch;
    const stakeAccounts = await connection.getParsedProgramAccounts(
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
            activationEpoch = parseEpoch(delegation.activationEpoch);
            deactivationEpoch = parseEpoch(delegation.deactivationEpoch);
            creditsObserved = parseInt(delegation.creditsObserved || "0");

            // Determine accurate status based on delegation state and epochs
            status = determineStakeStatus({
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
};
