import { Connection } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

export interface TxDetails {
  signature: string;
  found: boolean;
  network: "mainnet-beta" | "testnet" | "devnet";
  slot?: number;
  blockTime?: number | null;
  confirmationStatus?: string | null;
  err?: unknown;
  feeLamports?: number;
  computeUnitsConsumed?: number;
  // Keep it small; UI can render JSON as needed
  accountKeys?: string[];
  recentBlockhash?: string;
  logMessages?: string[];
  instructions?: Array<{
    programId: string;
    accounts: string[];
    data: string;
  }>;
}

export async function fetchTxDetails(params: {
  signature: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<TxDetails> {
  const network = params.network ?? "mainnet-beta";
  const endpoint = params.rpcEndpoint ?? getRPCEndpoint(network);

  const connection = new Connection(endpoint, { commitment: "confirmed" });

  // Fetch full transaction (maxSupportedTransactionVersion=0 matches your other usage)
  const tx = await connection.getTransaction(params.signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) {
    // Fallback: maybe exists but older/archival not available. Provide status if possible.
    const status = await connection.getSignatureStatus(params.signature, {
      searchTransactionHistory: true,
    });

    return {
      signature: params.signature,
      found: !!status.value,
      network,
      confirmationStatus: status.value?.confirmationStatus ?? null,
      err: status.value?.err,
    };
  }

  const msg = tx.transaction.message;

  // account keys differ between legacy and v0; `getAccountKeys` normalizes
  const keys = msg.getAccountKeys({
    accountKeysFromLookups: tx.meta?.loadedAddresses,
  });

  const accountKeys = keys.staticAccountKeys.map((k) => k.toBase58());

  const instructions = msg.compiledInstructions.map((ix) => {
    const programId = accountKeys[ix.programIdIndex];
    const accounts = ix.accountKeyIndexes.map((i) => accountKeys[i]);
    return {
      programId,
      accounts,
      data: Buffer.from(ix.data).toString("base64"),
    };
  });

  return {
    signature: params.signature,
    found: true,
    network,
    slot: tx.slot,
    blockTime: tx.blockTime,
    confirmationStatus: tx.meta?.err ? "failed" : "confirmed",
    err: tx.meta?.err,
    feeLamports: tx.meta?.fee,
    computeUnitsConsumed: tx.meta?.computeUnitsConsumed,
    recentBlockhash: msg.recentBlockhash,
    accountKeys,
    logMessages: tx.meta?.logMessages ?? [],
    instructions,
  };
}
