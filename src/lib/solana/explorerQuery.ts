export type ExplorerSearchKind = "tx" | "address" | "unknown";

// Solana tx signatures are base58 and typically 87-88 chars (can vary slightly)
function looksLikeSignature(input: string): boolean {
  const s = input.trim();
  if (s.length < 80 || s.length > 100) return false;
  // base58 charset without 0OIl
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(s);
}

function looksLikePubkey(input: string): boolean {
  const s = input.trim();
  // pubkeys are base58, usually 32-44 chars
  if (s.length < 32 || s.length > 44) return false;
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(s);
}

export function classifyExplorerQuery(input: string): ExplorerSearchKind {
  const s = input.trim();
  if (!s) return "unknown";
  // try pubkey first (many are 44)
  if (looksLikePubkey(s)) return "address";
  if (looksLikeSignature(s)) return "tx";
  return "unknown";
}
