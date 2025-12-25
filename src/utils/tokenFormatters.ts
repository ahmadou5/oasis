/**
 * Formatting utilities for token view
 */

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(num: number | string | undefined, decimals = 2): string {
  if (num === undefined || num === null) return "-";
  
  const n = typeof num === "string" ? parseFloat(num) : num;
  
  if (isNaN(n)) return "-";
  if (n === 0) return "0";
  
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
  
  return `${sign}${abs.toLocaleString(undefined, { maximumFractionDigits: decimals })}`;
}

/**
 * Format currency with $ symbol
 */
export function formatCurrency(num: number | string | undefined, decimals = 2): string {
  if (num === undefined || num === null) return "$-";
  
  const n = typeof num === "string" ? parseFloat(num) : num;
  
  if (isNaN(n)) return "$-";
  if (n === 0) return "$0";
  
  if (Math.abs(n) >= 1e9) return `$${formatLargeNumber(n, decimals)}`;
  if (Math.abs(n) >= 1e6) return `$${formatLargeNumber(n, decimals)}`;
  if (Math.abs(n) >= 1e3) return `$${formatLargeNumber(n, decimals)}`;
  
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`;
}

/**
 * Format percentage with + or - sign
 */
export function formatPercentage(num: number | string | undefined, decimals = 2): string {
  if (num === undefined || num === null) return "-";
  
  const n = typeof num === "string" ? parseFloat(num) : num;
  
  if (isNaN(n)) return "-";
  if (n === 0) return "0%";
  
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(decimals)}%`;
}

/**
 * Format address with ellipsis in middle
 */
export function formatAddress(address: string | undefined, startChars = 4, endChars = 4): string {
  if (!address) return "-";
  if (address.length <= startChars + endChars + 3) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format relative time (e.g., "2 min ago")
 */
export function formatRelativeTime(timestamp: number | undefined): string {
  if (!timestamp) return "-";
  
  const now = Date.now();
  const diff = now - (timestamp * 1000);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
}

/**
 * Format full timestamp
 */
export function formatFullTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return "-";
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get color class for positive/negative values
 */
export function getChangeColor(value: number | undefined): string {
  if (value === undefined || value === null || value === 0) return "text-gray-400";
  return value > 0 ? "text-green-400" : "text-red-400";
}

/**
 * Get background color class for positive/negative values
 */
export function getChangeBgColor(value: number | undefined): string {
  if (value === undefined || value === null || value === 0) return "bg-gray-800";
  return value > 0 ? "bg-green-900/30" : "bg-red-900/30";
}