import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

export interface AccountDetails {
  pubkey: string;
  found: boolean;
  network: "mainnet-beta" | "testnet" | "devnet";
  lamports?: number;
  owner?: string;
  executable?: boolean;
  rentEpoch?: number;
  dataLength?: number;
}

export async function fetchAccountDetails(params: {
  pubkey: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<AccountDetails> {
  const network = params.network ?? "mainnet-beta";
  const endpoint = params.rpcEndpoint ?? getRPCEndpoint(network);
  const connection = new Connection(endpoint, { commitment: "confirmed" });

  let key: PublicKey;
  try {
    key = new PublicKey(params.pubkey);
  } catch {
    return {
      pubkey: params.pubkey,
      found: false,
      network,
    };
  }

  const info = await connection.getAccountInfo(key, "confirmed");
  if (!info) {
    return {
      pubkey: key.toBase58(),
      found: false,
      network,
    };
  }

  return {
    pubkey: key.toBase58(),
    found: true,
    network,
    lamports: info.lamports,
    owner: info.owner.toBase58(),
    executable: info.executable,
    rentEpoch: info.rentEpoch,
    dataLength: info.data.length,
  };
}
