import { Connection, PublicKey, ParsedTransactionWithMeta, VersionedTransactionResponse } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";
import type { 
  TransactionDetail, 
  InstructionDetail, 
  BalanceChange, 
  TokenBalanceChange,
  ProgramInfo,
  SwapInfo,
  InstructionLog
} from "@/types/transaction";

/**
 * Enhanced Transaction Parser
 * Parses Solana transactions into detailed, human-readable format
 */

// Known program mapping
const KNOWN_PROGRAMS: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "Token Program",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": "Associated Token Program",
  "ComputeBudget111111111111111111111111111111": "Compute Budget Program",
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": "Jupiter Aggregator",
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Orca Whirlpool",
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium AMM",
  "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM": "Serum DEX",
  "SWiMDJYFUGj6cPrQ6QYYYWZtvXQdRChSVAygDZDsCHC": "Swim Protocol",
  "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo": "Solend",
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s": "Metaplex Token Metadata",
};

/**
 * Fetch and parse complete transaction details
 */
export async function fetchTransactionDetails(params: {
  signature: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<TransactionDetail> {
  const { signature, network = "mainnet-beta" } = params;
  
  try {
    const endpoint = getRPCEndpoint(network);
    const connection = new Connection(endpoint, { commitment: "confirmed" });
    
    // Fetch transaction
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    
    if (!tx) {
      throw new Error("Transaction not found");
    }
    
    // Parse transaction
    const parsed = await parseTransaction(tx, signature);
    return parsed;
    
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    throw error;
  }
}

/**
 * Parse transaction into detailed format
 */
function parseTransaction(
  tx: VersionedTransactionResponse,
  signature: string
): TransactionDetail {
  const meta = tx.meta;
  const message = tx.transaction.message;
  const accountKeys = message.getAccountKeys();
  
  // Extract programs
  const programs = extractPrograms(tx);
  
  // Parse instructions
  const instructions = parseInstructions(tx);
  
  // Calculate balance changes
  const balanceChanges = calculateBalanceChanges(tx);
  
  // Calculate token balance changes
  const tokenBalanceChanges = calculateTokenBalanceChanges(tx);
  
  // Extract logs
  const logs = meta?.logMessages || [];
  
  // Determine transaction type and swap info
  const type = determineTransactionType(instructions, tokenBalanceChanges);
  const swapInfo = extractSwapInfo(instructions, tokenBalanceChanges, programs);
  
  // Get fee payer and signers
  const feePayer = accountKeys.staticAccountKeys[0]?.toBase58() || "";
  const signers = accountKeys.staticAccountKeys
    .filter((_, i) => message.isAccountSigner(i))
    .map(k => k.toBase58());
  
  return {
    signature,
    blockTime: tx.blockTime || 0,
    slot: tx.slot,
    fee: meta?.fee || 0,
    computeUnitsConsumed: meta?.computeUnitsConsumed || 0,
    recentBlockhash: message.recentBlockhash,
    status: meta?.err ? "failed" : "success",
    type,
    programs,
    instructions,
    balanceChanges,
    tokenBalanceChanges,
    logs,
    rawData: tx,
    error: meta?.err ? JSON.stringify(meta.err) : undefined,
    swapInfo,
    feePayer,
    signers,
  };
}

/**
 * Extract program information
 */
function extractPrograms(tx: VersionedTransactionResponse): ProgramInfo[] {
  const message = tx.transaction.message;
  const accountKeys = message.getAccountKeys();
  const programIds = new Set<string>();
  
  // Get programs from instructions
  message.compiledInstructions.forEach(ix => {
    const programId = accountKeys.staticAccountKeys[ix.programIdIndex];
    if (programId) {
      programIds.add(programId.toBase58());
    }
  });
  
  // Get programs from inner instructions
  tx.meta?.innerInstructions?.forEach(inner => {
    inner.instructions.forEach(ix => {
      const programId = accountKeys.staticAccountKeys[ix.programIdIndex];
      if (programId) {
        programIds.add(programId.toBase58());
      }
    });
  });
  
  return Array.from(programIds).map(id => ({
    id,
    name: KNOWN_PROGRAMS[id] || "Unknown Program",
  }));
}

/**
 * Parse all instructions
 */
function parseInstructions(tx: VersionedTransactionResponse): InstructionDetail[] {
  const message = tx.transaction.message;
  const accountKeys = message.getAccountKeys();
  const instructions: InstructionDetail[] = [];
  
  message.compiledInstructions.forEach((ix, index) => {
    const programId = accountKeys.staticAccountKeys[ix.programIdIndex];
    const programIdStr = programId?.toBase58() || "";
    
    // Get accounts
    const accounts = ix.accountKeyIndexes.map(accountIndex => {
      const pubkey = accountKeys.staticAccountKeys[accountIndex];
      return {
        pubkey: pubkey?.toBase58() || "",
        isSigner: message.isAccountSigner(accountIndex),
        isWritable: message.isAccountWritable(accountIndex),
      };
    });
    
    // Get inner instructions
    const innerInstructions = tx.meta?.innerInstructions
      ?.find(inner => inner.index === index)
      ?.instructions.map((innerIx, innerIndex) => {
        const innerProgramId = accountKeys.staticAccountKeys[innerIx.programIdIndex];
        const innerProgramIdStr = innerProgramId?.toBase58() || "";
        
        return {
          index: innerIndex,
          programId: innerProgramIdStr,
          programName: KNOWN_PROGRAMS[innerProgramIdStr] || "Unknown",
          instructionType: "inner",
          accounts: innerIx.accountKeyIndexes.map(accountIndex => ({
            pubkey: accountKeys.staticAccountKeys[accountIndex]?.toBase58() || "",
            isSigner: message.isAccountSigner(accountIndex),
            isWritable: message.isAccountWritable(accountIndex),
          })),
          data: Buffer.from(innerIx.data).toString("base64"),
        };
      }) || [];
    
    instructions.push({
      index,
      programId: programIdStr,
      programName: KNOWN_PROGRAMS[programIdStr] || "Unknown Program",
      instructionType: "instruction",
      accounts,
      data: Buffer.from(ix.data).toString("base64"),
      innerInstructions: innerInstructions.length > 0 ? innerInstructions : undefined,
    });
  });
  
  return instructions;
}

/**
 * Calculate SOL balance changes
 */
function calculateBalanceChanges(tx: VersionedTransactionResponse): BalanceChange[] {
  const meta = tx.meta;
  if (!meta) return [];
  
  const accountKeys = tx.transaction.message.getAccountKeys();
  const preBalances = meta.preBalances;
  const postBalances = meta.postBalances;
  const message = tx.transaction.message;
  
  const changes: BalanceChange[] = [];
  
  preBalances.forEach((preBalance, index) => {
    const postBalance = postBalances[index];
    const change = postBalance - preBalance;
    
    if (change !== 0 || index === 0) {
      const pubkey = accountKeys.staticAccountKeys[index];
      const details: string[] = [];
      
      if (index === 0) details.push("Fee Payer");
      if (message.isAccountSigner(index)) details.push("Signer");
      if (message.isAccountWritable(index)) details.push("Writable");
      
      changes.push({
        address: pubkey?.toBase58() || "",
        owner: "System Program",
        preBalance,
        postBalance,
        change,
        details,
        isSigner: message.isAccountSigner(index),
        isWritable: message.isAccountWritable(index),
        isFeePayer: index === 0,
      });
    }
  });
  
  return changes;
}

/**
 * Calculate token balance changes
 */
function calculateTokenBalanceChanges(tx: VersionedTransactionResponse): TokenBalanceChange[] {
  const meta = tx.meta;
  if (!meta) return [];
  
  const preTokenBalances = meta.preTokenBalances || [];
  const postTokenBalances = meta.postTokenBalances || [];
  const accountKeys = tx.transaction.message.getAccountKeys();
  
  const changes: TokenBalanceChange[] = [];
  const processedAccounts = new Set<number>();
  
  postTokenBalances.forEach(postToken => {
    const accountIndex = postToken.accountIndex;
    processedAccounts.add(accountIndex);
    
    const preToken = preTokenBalances.find(pre => pre.accountIndex === accountIndex);
    const preAmount = preToken ? Number(preToken.uiTokenAmount.amount) : 0;
    const postAmount = Number(postToken.uiTokenAmount.amount);
    const change = postAmount - preAmount;
    
    const owner = postToken.owner || preToken?.owner || "";
    const tokenAccount = accountKeys.staticAccountKeys[accountIndex]?.toBase58() || "";
    
    changes.push({
      owner,
      tokenAccount,
      mint: postToken.mint,
      symbol: "TOKEN", // Would need metadata lookup
      decimals: postToken.uiTokenAmount.decimals,
      preAmount: preAmount / Math.pow(10, postToken.uiTokenAmount.decimals),
      postAmount: postAmount / Math.pow(10, postToken.uiTokenAmount.decimals),
      change: change / Math.pow(10, postToken.uiTokenAmount.decimals),
    });
  });
  
  return changes;
}

/**
 * Determine transaction type
 */
function determineTransactionType(
  instructions: InstructionDetail[],
  tokenChanges: TokenBalanceChange[]
): TransactionDetail["type"] {
  // Check for swap (Jupiter, Orca, Raydium)
  const hasSwapProgram = instructions.some(ix => 
    ix.programName.includes("Jupiter") ||
    ix.programName.includes("Orca") ||
    ix.programName.includes("Raydium")
  );
  
  if (hasSwapProgram && tokenChanges.length >= 2) {
    return "swap";
  }
  
  // Check for token transfer
  const hasTokenTransfer = instructions.some(ix => 
    ix.programName === "Token Program"
  );
  
  if (hasTokenTransfer) {
    return "transfer";
  }
  
  return "unknown";
}

/**
 * Extract swap information
 */
function extractSwapInfo(
  instructions: InstructionDetail[],
  tokenChanges: TokenBalanceChange[],
  programs: ProgramInfo[]
): SwapInfo | undefined {
  if (tokenChanges.length < 2) return undefined;
  
  const swapProgram = programs.find(p => 
    p.name.includes("Jupiter") ||
    p.name.includes("Orca") ||
    p.name.includes("Raydium")
  );
  
  if (!swapProgram) return undefined;
  
  // Find token being sold (negative change)
  const fromToken = tokenChanges.find(tc => tc.change < 0);
  // Find token being bought (positive change)
  const toToken = tokenChanges.find(tc => tc.change > 0);
  
  if (!fromToken || !toToken) return undefined;
  
  return {
    fromToken: {
      mint: fromToken.mint,
      symbol: fromToken.symbol,
      amount: Math.abs(fromToken.change),
      decimals: fromToken.decimals,
    },
    toToken: {
      mint: toToken.mint,
      symbol: toToken.symbol,
      amount: toToken.change,
      decimals: toToken.decimals,
    },
    program: swapProgram.id,
    programName: swapProgram.name,
  };
}

/**
 * Parse logs by instruction
 */
export function parseInstructionLogs(logs: string[]): InstructionLog[] {
  const instructionLogs: InstructionLog[] = [];
  let currentInstruction: InstructionLog | null = null;
  
  logs.forEach(log => {
    // Check for program invocation
    const invokeMatch = log.match(/Program (\w+) invoke \[(\d+)\]/);
    if (invokeMatch) {
      const programId = invokeMatch[1];
      if (currentInstruction) {
        instructionLogs.push(currentInstruction);
      }
      currentInstruction = {
        programId,
        programName: KNOWN_PROGRAMS[programId] || "Unknown Program",
        logs: [log],
      };
      return;
    }
    
    // Add log to current instruction
    if (currentInstruction) {
      currentInstruction.logs.push(log);
    }
    
    // Check for program completion
    if (log.includes("success") || log.includes("failed")) {
      if (currentInstruction) {
        instructionLogs.push(currentInstruction);
        currentInstruction = null;
      }
    }
  });
  
  if (currentInstruction) {
    instructionLogs.push(currentInstruction);
  }
  
  return instructionLogs;
}
