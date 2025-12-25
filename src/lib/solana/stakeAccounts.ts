import { Connection, PublicKey, StakeProgram } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

export interface StakeAccount {
  address: string;
  balance: number;
  state: "active" | "inactive" | "activating" | "deactivating";
  voter: string;
  activationEpoch: number;
  deactivationEpoch?: number;
  delegatedStake: number;
  rentExemptReserve: number;
}

/**
 * Fetch all stake accounts for a wallet
 */
export async function fetchStakeAccounts(params: {
  walletAddress: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<StakeAccount[]> {
  const { walletAddress, network = "mainnet-beta" } = params;

  try {
    const endpoint = getRPCEndpoint(network);
    const connection = new Connection(endpoint, { commitment: "confirmed" });
    const walletPubkey = new PublicKey(walletAddress);

    // Get all stake accounts owned by this wallet
    const stakeAccounts = await connection.getParsedProgramAccounts(
      StakeProgram.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 12, // Offset for staker pubkey in stake account
              bytes: walletPubkey.toBase58(),
            },
          },
        ],
      }
    );

    const accounts: StakeAccount[] = [];

    for (const account of stakeAccounts) {
      try {
        const parsedData = account.account.data;
        
        if ('parsed' in parsedData && parsedData.parsed?.type === "stake") {
          const info = parsedData.parsed.info;
          const stake = info.stake;
          const meta = info.meta;

          let state: StakeAccount["state"] = "inactive";
          let activationEpoch = 0;
          let deactivationEpoch: number | undefined;
          let delegatedStake = 0;

          if (stake?.delegation) {
            const delegation = stake.delegation;
            activationEpoch = delegation.activationEpoch || 0;
            
            if (delegation.deactivationEpoch && delegation.deactivationEpoch !== "18446744073709551615") {
              state = "deactivating";
              deactivationEpoch = Number(delegation.deactivationEpoch);
            } else if (activationEpoch > 0) {
              state = "active";
            } else {
              state = "activating";
            }

            delegatedStake = Number(delegation.stake || 0);
          }

          accounts.push({
            address: account.pubkey.toBase58(),
            balance: account.account.lamports / 1e9,
            state,
            voter: stake?.delegation?.voter || "",
            activationEpoch,
            deactivationEpoch,
            delegatedStake: delegatedStake / 1e9,
            rentExemptReserve: Number(meta?.rentExemptReserve || 0) / 1e9,
          });
        }
      } catch (error) {
        console.warn(`Failed to parse stake account ${account.pubkey.toBase58()}:`, error);
      }
    }

    return accounts;
  } catch (error) {
    console.error("Failed to fetch stake accounts:", error);
    return [];
  }
}
