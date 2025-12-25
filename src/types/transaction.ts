/**
 * Comprehensive Transaction Types
 * For detailed transaction analysis and visualization
 */

export type TransactionStatus = 'success' | 'failed' | 'pending';
export type TransactionType = 'swap' | 'transfer' | 'mint' | 'burn' | 'create' | 'close' | 'unknown';

export interface TransactionDetail {
  signature: string;
  blockTime: number;
  slot: number;
  fee: number;
  computeUnitsConsumed: number;
  recentBlockhash: string;
  status: TransactionStatus;
  type: TransactionType;
  programs: ProgramInfo[];
  instructions: InstructionDetail[];
  balanceChanges: BalanceChange[];
  tokenBalanceChanges: TokenBalanceChange[];
  logs: string[];
  rawData: any;
  error?: string;
  
  // Swap specific
  swapInfo?: SwapInfo;
  
  // Signer info
  feePayer: string;
  signers: string[];
}

export interface SwapInfo {
  fromToken: {
    mint: string;
    symbol: string;
    amount: number;
    decimals: number;
  };
  toToken: {
    mint: string;
    symbol: string;
    amount: number;
    decimals: number;
  };
  program: string;
  programName: string;
}

export interface ProgramInfo {
  id: string;
  name: string;
  icon?: string;
}

export interface InstructionDetail {
  index: number;
  programId: string;
  programName: string;
  instructionType: string;
  accounts: AccountMeta[];
  data: string;
  innerInstructions?: InstructionDetail[];
  parsed?: ParsedInstructionData;
}

export interface AccountMeta {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
  role?: string; // e.g., "source", "destination", "authority"
}

export interface ParsedInstructionData {
  type: string;
  info?: Record<string, any>;
  description?: string;
}

export interface BalanceChange {
  address: string;
  owner: string;
  preBalance: number;
  postBalance: number;
  change: number;
  details: string[];
  isSigner: boolean;
  isWritable: boolean;
  isFeePayer: boolean;
}

export interface TokenBalanceChange {
  owner: string;
  tokenAccount: string;
  mint: string;
  symbol: string;
  decimals: number;
  preAmount: number;
  postAmount: number;
  change: number;
  logo?: string;
}

export interface InstructionLog {
  programId: string;
  programName: string;
  logs: string[];
}
