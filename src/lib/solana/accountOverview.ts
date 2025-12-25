import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

export type AccountKind =
  | "wallet"
  | "tokenAccount"
  | "tokenMint"
  | "stakeAccount"
  | "program"
  | "unknown";

export type TokenHolding = {
  tokenAccount: string;
  mint: string;
  owner: string;
  amount: string; // UI-friendly (already adjusted by decimals)
  uiAmount: number;
  decimals: number;
  program: "spl-token" | "token-2022";
  // Optional metadata (Metaplex)
  name?: string;
  symbol?: string;
  uri?: string;
};

export type TxSignatureItem = {
  signature: string;
  slot: number;
  blockTime: number | null;
  confirmationStatus: string | null;
  err: unknown;
  memo?: string | null;
};

export type StakeAccountOverview = {
  address: string;
  staker?: string;
  withdrawer?: string;
  voter?: string;
  delegatedStakeLamports?: number;
  activationEpoch?: number;
  deactivationEpoch?: number;
  state?: string;
  signatures: TxSignatureItem[];
};

export type AccountOverview = {
  pubkey: string;
  found: boolean;
  network: "mainnet-beta" | "testnet" | "devnet";

  kind: AccountKind;

  lamports?: number;
  sol?: number;
  owner?: string;
  executable?: boolean;
  rentEpoch?: number;
  dataLength?: number;

  // For wallet address
  tokenHoldings?: TokenHolding[];
  walletSignatures?: TxSignatureItem[];
  stakeAccounts?: StakeAccountOverview[];

  // For token account / mint / stake / program
  parsed?: unknown;
};

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const STAKE_PROGRAM = "Stake11111111111111111111111111111111111111";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

function lamportsToSol(lamports: number) {
  return lamports / 1_000_000_000;
}

function mapSig(
  s: Awaited<ReturnType<Connection["getSignaturesForAddress"]>>[number]
): TxSignatureItem {
  return {
    signature: s.signature,
    slot: s.slot,
    blockTime: s.blockTime ?? null,
    confirmationStatus: s.confirmationStatus ?? null,
    err: s.err,
    memo: s.memo ?? null,
  };
}

export async function fetchAccountOverview(params: {
  pubkey: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
  txLimit?: number; // default 25
  stakeTxLimit?: number; // default 25
  maxStakeAccounts?: number; // safety cap
}): Promise<AccountOverview> {
  const network = params.network ?? "mainnet-beta";
  // Best-effort RPC failover (same strategy as explorer search)
  const { getRPCFailoverEndpoints } = await import("@/config/env");
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

  const makeConn = (url: string) => new Connection(url, { commitment: "confirmed" });

  const withFailover = async <T>(fn: (c: Connection) => Promise<T>) => {
    for (let i = 0; i < tryable.length; i++) {
      const ep = tryable[i];
      try {
        return await fn(makeConn(ep.url));
      } catch (e) {
        if (i < tryable.length - 1 && isRetryable(e)) continue;
        throw new Error(
          `RPC failed via ${ep.label} (${ep.url}): ${String((e as any)?.message ?? e)}`
        );
      }
    }
    throw new Error("No RPC endpoints available");
  };

  const txLimit = Math.min(Math.max(params.txLimit ?? 25, 1), 100);
  const stakeTxLimit = Math.min(Math.max(params.stakeTxLimit ?? 25, 1), 100);
  const maxStakeAccounts = Math.min(Math.max(params.maxStakeAccounts ?? 10, 1), 50);

  let key: PublicKey;
  try {
    key = new PublicKey(params.pubkey);
  } catch {
    return {
      pubkey: params.pubkey,
      found: false,
      network,
      kind: "unknown",
    };
  }

  const parsedInfo = await withFailover((c) => c.getParsedAccountInfo(key, "confirmed"));
  const value = parsedInfo.value;
  if (!value) {
    return { pubkey: key.toBase58(), found: false, network, kind: "unknown" };
  }

  const owner = value.owner.toBase58();
  const lamports = value.lamports;
  const executable = value.executable;
  // `getParsedAccountInfo` returns `data` as either a parsed object or base64 tuple.
  // We only need a rough length for display.
  const dataAny: any = value.data as any;
  const dataLength =
    typeof dataAny === "string"
      ? dataAny.length
      : typeof dataAny?.length === "number"
        ? dataAny.length
        : Array.isArray(dataAny)
          ? (dataAny[0]?.length ?? 0)
          : 0;

  // classify
  let kind: AccountKind = "unknown";
  if (executable) kind = "program";
  else if (owner === STAKE_PROGRAM) kind = "stakeAccount";
  else if (owner === TOKEN_PROGRAM || owner === TOKEN_2022_PROGRAM) {
    const p: any = (value.data as any)?.parsed;
    const t = p?.type;
    if (t === "mint") kind = "tokenMint";
    else if (t === "account") kind = "tokenAccount";
    else kind = "tokenAccount";
  } else if (owner === SYSTEM_PROGRAM) kind = "wallet";

  const base: AccountOverview = {
    pubkey: key.toBase58(),
    found: true,
    network,
    kind,
    lamports,
    sol: lamportsToSol(lamports),
    owner,
    executable,
    rentEpoch: (value as any).rentEpoch,
    dataLength,
    parsed: (value.data as any)?.parsed,
  };

  if (kind === "wallet") {
    const [walletSigs, tokenHoldings, stakeAccounts] = await Promise.all([
      withFailover((c) => c.getSignaturesForAddress(key, { limit: txLimit })),
      withFailover((c) => fetchTokenHoldings({ connection: c, owner: key })),
      withFailover((c) =>
        fetchStakeAccountsByAuthority({
          connection: c,
          authority: key,
          stakeTxLimit,
          maxStakeAccounts,
        })
      ),
    ]);

    return {
      ...base,
      walletSignatures: walletSigs.map(mapSig),
      tokenHoldings,
      stakeAccounts,
    };
  }

  // Stake / token / program: still show tx history
  const sigs = await withFailover((c) =>
    c.getSignaturesForAddress(key, {
      limit: kind === "stakeAccount" ? stakeTxLimit : txLimit,
    })
  );

  return {
    ...base,
    walletSignatures: sigs.map(mapSig),
  };
}

async function fetchTokenHoldings(params: {
  connection: Connection;
  owner: PublicKey;
}): Promise<TokenHolding[]> {
  const { connection, owner } = params;

  const [spl, t22] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(owner, {
      programId: new PublicKey(TOKEN_PROGRAM),
    }),
    connection.getParsedTokenAccountsByOwner(owner, {
      programId: new PublicKey(TOKEN_2022_PROGRAM),
    }),
  ]);

  const items = [
    ...spl.value.map((v) => ({ v, program: "spl-token" as const })),
    ...t22.value.map((v) => ({ v, program: "token-2022" as const })),
  ];

  const holdings: TokenHolding[] = items
    .map(({ v, program }) => {
      const parsed: any = v.account.data.parsed;
      const info = parsed?.info;
      const mint = String(info?.mint ?? "");
      const tokenOwner = String(info?.owner ?? "");
      const amountInfo = info?.tokenAmount;
      const decimals = Number(amountInfo?.decimals ?? 0);
      const uiAmount = Number(amountInfo?.uiAmount ?? 0);
      const amount = String(amountInfo?.uiAmountString ?? uiAmount.toString());

      return {
        tokenAccount: v.pubkey.toBase58(),
        mint,
        owner: tokenOwner,
        amount,
        uiAmount,
        decimals,
        program,
      };
    })
    .filter((h) => h.mint && h.owner);

  // Metaplex metadata for each mint (option 1c)
  const uniqueMints = Array.from(new Set(holdings.map((h) => h.mint)));
  const metaByMint = await fetchMetaplexMetadataByMint({
    connection,
    mints: uniqueMints,
  });

  return holdings
    .map((h) => ({ ...h, ...(metaByMint.get(h.mint) ?? {}) }))
    .sort((a, b) => b.uiAmount - a.uiAmount);
}

async function fetchStakeAccountsByAuthority(params: {
  connection: Connection;
  authority: PublicKey;
  stakeTxLimit: number;
  maxStakeAccounts: number;
}): Promise<StakeAccountOverview[]> {
  const { connection, authority, stakeTxLimit, maxStakeAccounts } = params;

  const stakeProgramId = new PublicKey(STAKE_PROGRAM);

  // Stake account meta layout: 4 (enum) + 8 (rentExemptReserve) = 12
  // staker pubkey offset 12, withdrawer pubkey offset 44
  const stakerFilter = {
    memcmp: { offset: 12, bytes: authority.toBase58() },
  };
  const withdrawerFilter = {
    memcmp: { offset: 44, bytes: authority.toBase58() },
  };

  const [asStaker, asWithdrawer] = await Promise.all([
    connection.getParsedProgramAccounts(stakeProgramId, { filters: [stakerFilter] }),
    connection.getParsedProgramAccounts(stakeProgramId, { filters: [withdrawerFilter] }),
  ]);

  const merged = new Map<string, (typeof asStaker)[number]>();
  for (const x of asStaker) merged.set(x.pubkey.toBase58(), x);
  for (const x of asWithdrawer) merged.set(x.pubkey.toBase58(), x);

  const accounts = Array.from(merged.values()).slice(0, maxStakeAccounts);

  const parsedList: StakeAccountOverview[] = accounts.map((a) => {
    const parsed: any = (a.account.data as any)?.parsed;
    const info = parsed?.info;

    const meta = info?.meta;
    const staker = meta?.authorized?.staker as string | undefined;
    const withdrawer = meta?.authorized?.withdrawer as string | undefined;

    const stake = info?.stake;
    const delegation = stake?.delegation;

    const toNum = (x: any): number | undefined => {
      if (typeof x === "number") return x;
      if (typeof x === "string") {
        const n = Number(x);
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };

    return {
      address: a.pubkey.toBase58(),
      staker,
      withdrawer,
      voter: delegation?.voter as string | undefined,
      delegatedStakeLamports: toNum(delegation?.stake),
      activationEpoch: toNum(delegation?.activationEpoch),
      deactivationEpoch: toNum(delegation?.deactivationEpoch),
      state: parsed?.type,
      signatures: [],
    };
  });

  const sigLists = await Promise.all(
    parsedList.map(async (s) => {
      const sigs = await connection.getSignaturesForAddress(new PublicKey(s.address), {
        limit: stakeTxLimit,
      });
      return sigs.map(mapSig);
    })
  );

  return parsedList.map((s, i) => ({ ...s, signatures: sigLists[i] ?? [] }));
}

// ---- Metaplex on-chain metadata (option 1c) ----

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

type MintMetadata = { name?: string; symbol?: string; uri?: string };

async function fetchMetaplexMetadataByMint(params: {
  connection: Connection;
  mints: string[];
}): Promise<Map<string, MintMetadata>> {
  const { connection, mints } = params;

  const out = new Map<string, MintMetadata>();
  if (mints.length === 0) return out;

  // Dynamic import keeps client bundles smaller.
  // We use `deserializeMetadata` to parse the Metadata account, but derive the PDA
  // ourselves (pure Solana address derivation) to avoid requiring an Umi context.
  const { deserializeMetadata } = await import(
    "@metaplex-foundation/mpl-token-metadata"
  );

  const pdaList = mints.map((mint) => {
    const mintKey = new PublicKey(mint);
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );
    return { mint, pda };
  });

  const accounts = await connection.getMultipleAccountsInfo(
    pdaList.map((x) => x.pda),
    "confirmed"
  );

  accounts.forEach((acc, i) => {
    if (!acc) return;
    try {
      const md = deserializeMetadata({
        publicKey: pdaList[i].pda.toBase58(),
        // Umi expects owner as a public key-ish value; we provide base58.
        owner: acc.owner.toBase58(),
        lamports: acc.lamports,
        executable: acc.executable,
        data: acc.data,
      } as any);
      const data: any = (md as any).data;
      out.set(pdaList[i].mint, {
        name: data?.name?.trim() || undefined,
        symbol: data?.symbol?.trim() || undefined,
        uri: data?.uri?.trim() || undefined,
      });
    } catch {
      // ignore
    }
  });

  return out;
}
