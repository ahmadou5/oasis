import { ValidatorInfo } from "@/types";

// StakeWiz public validators endpoint
const STAKEWIZ_VALIDATORS_URL = "https://api.stakewiz.com/validators";

/**
 * Raw StakeWiz validator item as returned by https://api.stakewiz.com/validators
 * Keep fields optional-ish to be resilient to upstream changes.
 */
export interface StakeWizValidator {
  rank: number;
  identity: string;
  vote_identity: string;

  last_vote: number;
  root_slot: number;
  credits: number;
  epoch_credits: number;

  activated_stake: number;
  version: string;
  delinquent: boolean;

  skip_rate: number;
  wiz_skip_rate?: number;

  updated_at: string;
  first_epoch_with_stake?: number;

  name?: string;
  keybase?: string;
  description?: string;
  website?: string;
  commission: number;
  image?: string;

  ip_latitude?: string;
  ip_longitude?: string;
  ip_city?: string;
  ip_country?: string;
  ip_asn?: string;
  ip_org?: string;

  is_jito?: boolean;
  jito_commission_bps?: number;

  vote_success?: number;
  uptime?: number;

  epoch?: number;
  apy_estimate?: number;
  staking_apy?: number;
  jito_apy?: number;
  total_apy?: number;
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function mapStakeWizToValidatorInfo(v: StakeWizValidator): ValidatorInfo {
  const latitude = toNumber(v.ip_latitude);
  const longitude = toNumber(v.ip_longitude);

  // In StakeWiz response activated_stake appears to be in SOL already
  const stakeSol = typeof v.activated_stake === "number" ? v.activated_stake : 0;

  return {
    // You requested using node identity as the address
    address: v.identity,
    votingPubkey: v.vote_identity,

    name: v.name || `Validator ${v.identity.slice(0, 8)}...`,
    commission: typeof v.commission === "number" ? v.commission : 0,

    // Existing UI fields
    stake: stakeSol,
    delegatedStake: stakeSol,
    activatedStake: stakeSol,

    apy: typeof v.total_apy === "number" ? v.total_apy : 0,
    skipRate:
      typeof v.skip_rate === "number"
        ? v.skip_rate
        : typeof v.wiz_skip_rate === "number"
          ? v.wiz_skip_rate
          : 0,

    dataCenter: v.ip_org || v.ip_asn || "Unknown",

    website: v.website || undefined,
    description: v.description || "Solana validator node",
    avatar: v.image || "",

    status: v.delinquent ? "delinquent" : "active",

    // Previously this was a number[] derived from RPC epochCredits.
    // StakeWiz provides only epoch_credits (single value), so we keep it minimal.
    epochCredits: typeof v.epoch_credits === "number" ? [v.epoch_credits] : [],

    lastVote: typeof v.last_vote === "number" ? v.last_vote : 0,
    rootSlot: typeof v.root_slot === "number" ? v.root_slot : 0,

    // Enhanced metadata used across the app
    country: v.ip_country || undefined,
    city: v.ip_city || undefined,

    // ASN etc (store in existing optional fields where it makes sense)
    uptime: typeof v.uptime === "number" ? v.uptime : undefined,

    performanceHistory: [],

    location:
      typeof latitude === "number" && typeof longitude === "number"
        ? {
            coordinates: [longitude, latitude],
            city: v.ip_city || undefined,
            country: v.ip_country || undefined,
            countryCode: undefined,
            latitude,
            longitude,
            lat: latitude,
            lng: longitude,
          }
        : undefined,

    // StakeWiz-specific extensions (added to ValidatorInfo as optional fields)
    identity: v.identity,
    voteIdentity: v.vote_identity,
    rank: v.rank,
    version: v.version,
    isJito: v.is_jito,
    asn: v.ip_asn,
    asnOrganization: v.ip_org,
    totalApy: v.total_apy,
    stakingApy: v.staking_apy,
    jitoApy: v.jito_apy,
  };
}

export async function fetchStakeWizValidators(): Promise<StakeWizValidator[]> {
  const res = await fetch(STAKEWIZ_VALIDATORS_URL, {
    // cache on the server side; no fallback as requested
    next: { revalidate: 60 },
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`StakeWiz request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("StakeWiz response was not an array");
  }

  return data as StakeWizValidator[];
}

export async function fetchStakeWizValidatorInfos(): Promise<ValidatorInfo[]> {
  const raw = await fetchStakeWizValidators();
  return raw.map(mapStakeWizToValidatorInfo);
}

export async function getStakeWizValidatorByAddress(
  address: string
): Promise<ValidatorInfo | null> {
  const raw = await fetchStakeWizValidators();
  const found = raw.find(
    (v) => v.identity === address || v.vote_identity === address
  );
  return found ? mapStakeWizToValidatorInfo(found) : null;
}
