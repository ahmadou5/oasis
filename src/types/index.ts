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
  // Enhanced metadata from Solana Beach
  country?: string;
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
}
