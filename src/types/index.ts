export interface LayoutProps {
  children: React.ReactNode;
}

export interface ValidatorInfo {
  address: string;
  name: string;
  commission: number;
  stake: number;
  apy: number;
  delegatedStake: number;
  skipRate: number;
  dataCenter: string;
  website?: string;
  description?: string;
  avatar?: string;
  status: "active" | "delinquent" | "inactive";
  epochCredits: number[];
  votingPubkey: string;
  activatedStake: number;
  lastVote: number;
  rootSlot: number;

  // StakeWiz extensions (optional, for richer UI without breaking existing components)
  identity?: string;
  voteIdentity?: string;
  rank?: number;
  version?: string;
  isJito?: boolean;
  asn?: string;
  asnOrganization?: string;
  totalApy?: number;
  stakingApy?: number;
  jitoApy?: number;
  // Additional properties used in ValidatorWorldMap
  voteAccount?: string;
  imageUrl?: string;
  score?: number;
  // Enhanced metadata from Solana Beach
  country?: string;
  city?: string;
  region?: string;
  continent?: string;
  keybaseUsername?: string;
  twitterUsername?: string;
  uptime?: number;
  performanceHistory: Array<{
    epoch: number;
    activeStake: number; // NEW
    activeStakeAccounts: number; // NEW
    skipRate: number;
    credits: number;
    apy: number;
  }>;
  // Location data for mapping (compatible with PNodes)
  location?: NodeLocation;
}

// App Mode Types
export type AppMode = 'normal' | 'xandeum';

// Raw Xandeum Node interface (from API response)
export interface XandeumNode {
  address: string;
  is_public: boolean;
  last_seen_timestamp: number;
  pubkey: string;
  rpc_port: number;
  storage_committed: number;
  storage_usage_percent: number;
  storage_used: number;
  uptime: number;
  version: string;
}

// Location interface for consistent use across components
export interface NodeLocation {
  coordinates: [number, number]; // [longitude, latitude] - primary format from API
  city?: string;
  country?: string;
  countryCode?: string;
  // Helper properties for different component formats (computed from coordinates if needed)
  latitude?: number; // computed from coordinates[1] 
  longitude?: number; // computed from coordinates[0]
  lat?: number; // alias for latitude
  lng?: number; // alias for longitude
}

// Enhanced Xandeum Node with computed metrics
export interface XandeumPNodeStatsResult {
  metadata: {
    total_bytes: number;
    total_pages: number;
    last_updated: number; // unix seconds
  };
  stats: {
    cpu_percent: number;
    ram_used: number;
    ram_total: number;
    uptime: number;
    packets_received: number;
    packets_sent: number;
    active_streams: number;
  };
  file_size: number;
}

export interface XandeumNodeWithMetrics extends XandeumNode {
  // Computed fields for UI
  isOnline: boolean;
  lastSeenDate: string;
  storageUtilization: string;
  uptimeHours: number;
  uptimeDays: number;
  storageCapacityGB: number;
  storageUsedMB: number;
  versionDisplayName: string;
  healthScore: number; // 0-100 composite score
  location?: NodeLocation;

  // Enriched per-PNode stats (from JSON-RPC method: get-stats)
  // Optional because nodes may be offline/unreachable.
  pnodeStats?: XandeumPNodeStatsResult;

  // Convenience mirrors for UI usage (derived from pnodeStats)
  fileSizeBytes?: number;

  // Additional fields for PNode functionality
  name?: string;
  commission?: number;
  apy?: number;
  stake?: number;

  // Xandeum-specific properties for PNodeDetailView
  xandeumApy?: number;
  totalPnodeStake?: number;
  xandeumCommission?: number;
  pnodeRank?: number;
  efficiency?: number;
  reliability?: number;
  networkContribution?: number;
  minStakeAmount?: number;
  maxStakeAmount?: number;
  lockPeriod?: number;
  earlyWithdrawPenalty?: number;
  rewardStructure?: string;
  lastPayout?: number;
  nextPayoutEpoch?: number;
  dataCenter?: string;
  country?: string;
  website?: string;
}

export interface XandeumPNodeInfo extends Omit<ValidatorInfo, 'commission' | 'apy'> {
  // Xandeum-specific properties
  nodeType: 'pnode';
  rewardStructure: 'fixed' | 'dynamic';
  minStakeAmount: number;
  maxStakeAmount: number;
  lockPeriod: number; // in epochs
  earlyWithdrawPenalty: number; // percentage
  xandeumCommission: number;
  xandeumApy: number;
  totalPnodeStake: number;
  pnodeRank: number;
  networkContribution: number; // percentage
  lastPayout: number; // timestamp
  nextPayoutEpoch: number;
  // Additional Xandeum metrics
  efficiency: number; // 0-100
  reliability: number; // 0-100
  xandeumScore: number; // composite score
}

// Union type for both validator types
export type NodeInfo = ValidatorInfo | XandeumPNodeInfo;

// Type guards
export const isXandeumPNode = (node: NodeInfo): node is XandeumPNodeInfo => {
  return 'nodeType' in node && node.nodeType === 'pnode';
}

export const isNormalValidator = (node: NodeInfo): node is ValidatorInfo => {
  return !('nodeType' in node);
}
