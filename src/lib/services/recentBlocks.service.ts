import { Connection, VersionedBlockResponse } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

export interface RecentBlock {
  slot: number;
  blockhash: string;
  blockTime: number | null;
  parentSlot: number;
  transactions: number;
  validatorIdentity: string | null;
  validatorVoteAccount: string | null;
  rewards: Array<{
    pubkey: string;
    lamports: number;
    rewardType: string | null;
  }>;
}

export interface FetchRecentBlocksParams {
  limit?: number;
  rpcEndpoint?: string;
  commitment?: "processed" | "confirmed" | "finalized";
}

const MAX_LIMIT = 50;

export async function fetchRecentBlocksFromRpc(
  params: FetchRecentBlocksParams = {}
): Promise<RecentBlock[]> {
  const limit = Math.max(1, Math.min(params.limit ?? 10, MAX_LIMIT));
  const rpcEndpoint = params.rpcEndpoint ?? getRPCEndpoint("mainnet-beta");
  const commitment = params.commitment ?? "confirmed";

  const connection = new Connection(rpcEndpoint, { commitment });

  const latestSlot = await connection.getSlot(commitment);

  const blockPromises: Promise<VersionedBlockResponse | null>[] = [];
  for (let i = 0; i < limit; i++) {
    const slot = latestSlot - i;
    if (slot < 0) break;
    blockPromises.push(
      connection.getBlock(slot, {
        maxSupportedTransactionVersion: 0,
        rewards: true,
      })
    );
  }

  const settled = await Promise.allSettled(blockPromises);

  const blocks: RecentBlock[] = [];
  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    if (result.status !== "fulfilled" || !result.value) continue;

    const block = result.value;
    const slot = latestSlot - i;

    // Heuristic: block producer can often be inferred from a fee reward entry
    const validatorReward = block.rewards?.find(
      (r) => r.rewardType === "fee" || r.rewardType === null
    );

    blocks.push({
      slot,
      blockhash: block.blockhash,
      blockTime: block.blockTime,
      parentSlot: block.parentSlot,
      transactions: block.transactions?.length || 0,
      validatorIdentity: validatorReward?.pubkey || null,
      validatorVoteAccount: null,
      rewards: block.rewards || [],
    });
  }

  blocks.sort((a, b) => b.slot - a.slot);
  return blocks;
}
