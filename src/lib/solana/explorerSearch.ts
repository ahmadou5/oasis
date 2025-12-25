import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint, getRPCFailoverEndpoints } from "@/config/env";
import {
  classifyExplorerQuery,
  type ExplorerSearchKind,
} from "./explorerQuery";

export interface ExplorerSearchResultBase {
  kind: ExplorerSearchKind;
  input: string;
  network: "mainnet-beta" | "testnet" | "devnet";
}

export interface ExplorerSearchTxResult extends ExplorerSearchResultBase {
  kind: "tx";
  signature: string;
  found: boolean;
}

export interface ExplorerSearchAddressResult extends ExplorerSearchResultBase {
  kind: "address";
  address: string;
  found: boolean;
  // heuristic classification (explorers do this too)
  addressType: "program" | "stake" | "mint" | "system" | "unknown";
}

export interface ExplorerSearchUnknownResult extends ExplorerSearchResultBase {
  kind: "unknown";
  reason: string;
}

export type ExplorerSearchResult =
  | ExplorerSearchTxResult
  | ExplorerSearchAddressResult
  | ExplorerSearchUnknownResult;

export async function explorerSearch(params: {
  q: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<ExplorerSearchResult> {
  const network = params.network ?? "mainnet-beta";
  const input = params.q.trim();

  const kind = classifyExplorerQuery(input);
  if (kind === "unknown") {
    return {
      kind: "unknown",
      input,
      network,
      reason: "Query is not a valid base58 transaction signature or address",
    };
  }

  const endpoints = params.rpcEndpoint
    ? [{ label: "param", url: params.rpcEndpoint }]
    : getRPCFailoverEndpoints(network);

  const tryable = endpoints.length
    ? endpoints
    : [{ label: "default", url: getRPCEndpoint(network) }];

  const isRetryable = (e: unknown) => {
    const msg = String((e as any)?.message ?? e);
    return (
      msg.includes("fetch failed") ||
      msg.includes("ECONN") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("ENOTFOUND")
    );
  };

  if (kind === "tx") {
    for (let i = 0; i < tryable.length; i++) {
      const ep = tryable[i];
      const connection = new Connection(ep.url, { commitment: "confirmed" });
      try {
        // `getTransaction` is heavier; `getSignatureStatus` is cheaper but less detail.
        // For search routing, we only need existence.
        const status = await connection.getSignatureStatus(input, {
          searchTransactionHistory: true,
        });

        return {
          kind: "tx",
          input,
          network,
          signature: input,
          found: !!status.value,
        };
      } catch (e) {
        if (i < tryable.length - 1 && isRetryable(e)) continue;
        throw new Error(
          `failed to get signature status via ${ep.label} (${ep.url}): ${String(
            (e as any)?.message ?? e
          )}`
        );
      }
    }
  }

  // address
  let pubkey: PublicKey;
  try {
    pubkey = new PublicKey(input);
  } catch {
    return {
      kind: "unknown",
      input,
      network,
      reason: "Invalid address (failed to parse as PublicKey)",
    };
  }

  // Determine if it exists and do a light classification
  let info: Awaited<ReturnType<Connection["getAccountInfo"]>> = null;
  for (let i = 0; i < tryable.length; i++) {
    const ep = tryable[i];
    const connection = new Connection(ep.url, { commitment: "confirmed" });
    try {
      info = await connection.getAccountInfo(pubkey, "confirmed");
      break;
    } catch (e) {
      if (i < tryable.length - 1 && isRetryable(e)) continue;
      throw new Error(
        `failed to get info about account ${pubkey.toBase58()}: ${String(
          (e as any)?.message ?? e
        )}`
      );
    }
  }

  let addressType: ExplorerSearchAddressResult["addressType"] = "unknown";
  if (!info) {
    addressType = "unknown";
  } else if (info.owner?.toBase58() === "11111111111111111111111111111111") {
    addressType = "system";
  } else {
    // Heuristics:
    // - stake accounts are owned by Stake program
    // - token mints/accounts are owned by SPL Token program
    const owner = info.owner?.toBase58();
    if (owner === "Stake11111111111111111111111111111111111111") {
      addressType = "stake";
    } else if (
      owner === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ||
      owner === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" // token-2022
    ) {
      // Distinguishing mint vs token account needs unpacking data; keep it simple.
      addressType = "mint";
    } else if (info.executable) {
      addressType = "program";
    }
  }

  return {
    kind: "address",
    input,
    network,
    address: pubkey.toBase58(),
    found: !!info,
    addressType,
  };
}
