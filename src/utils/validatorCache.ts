// utils/validatorCache.ts

import { ValidatorInfo } from "@/store/slices/validatorSlice";

interface EpochDetails {
  absoluteSlot: number;
  blockHeight: number;
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  transactionCount: number;
  epochStartTime: number;
  slotTime: number;
}

interface CachedValidatorData {
  validators: ValidatorInfo[];
  epochDetails: EpochDetails;
  timestamp: number;
  version: string;
}

const CACHE_CONFIG = {
  VALIDATORS_KEY: "solana_validators_cache",
  TTL: 10 * 60 * 1000, // 10 minutes in milliseconds
  VERSION: "1.0", // Increment this when data structure changes
};

/**
 * Saves validator data to localStorage with timestamp
 */
export function saveValidatorsToCache(
  validators: ValidatorInfo[],
  epochDetails: EpochDetails
): boolean {
  try {
    const cacheData: CachedValidatorData = {
      validators,
      epochDetails,
      timestamp: Date.now(),
      version: CACHE_CONFIG.VERSION,
    };

    localStorage.setItem(
      CACHE_CONFIG.VALIDATORS_KEY,
      JSON.stringify(cacheData)
    );

    console.log("✅ Validator data cached successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to save to cache:", error);
    // localStorage might be full or disabled
    return false;
  }
}

/**
 * Loads validator data from localStorage if valid
 * Returns null if cache is invalid, expired, or missing
 */
export function loadValidatorsFromCache(): CachedValidatorData | null {
  try {
    const cachedString = localStorage.getItem(CACHE_CONFIG.VALIDATORS_KEY);

    if (!cachedString) {
      console.log("📭 No cached data found");
      return null;
    }

    const cachedData: CachedValidatorData = JSON.parse(cachedString);

    // Check version compatibility
    if (cachedData.version !== CACHE_CONFIG.VERSION) {
      console.log("🔄 Cache version mismatch, clearing old cache");
      clearValidatorCache();
      return null;
    }

    // Check if cache is still valid (not expired)
    if (!isCacheValid(cachedData.timestamp)) {
      console.log("⏰ Cache expired");
      clearValidatorCache();
      return null;
    }

    console.log("✅ Loading data from cache");
    return cachedData;
  } catch (error) {
    console.error("❌ Failed to load from cache:", error);
    clearValidatorCache(); // Clear corrupted cache
    return null;
  }
}

/**
 * Checks if cached data is still valid based on TTL
 */
export function isCacheValid(timestamp: number): boolean {
  const now = Date.now();
  const age = now - timestamp;
  return age < CACHE_CONFIG.TTL;
}

/**
 * Clears validator cache from localStorage
 */
export function clearValidatorCache(): void {
  try {
    localStorage.removeItem(CACHE_CONFIG.VALIDATORS_KEY);
    console.log("🗑️ Cache cleared");
  } catch (error) {
    console.error("❌ Failed to clear cache:", error);
  }
}

/**
 * Gets cache age in minutes
 */
export function getCacheAge(): number | null {
  try {
    const cachedString = localStorage.getItem(CACHE_CONFIG.VALIDATORS_KEY);
    if (!cachedString) return null;

    const cachedData: CachedValidatorData = JSON.parse(cachedString);
    const ageInMs = Date.now() - cachedData.timestamp;
    return Math.floor(ageInMs / 60000); // Convert to minutes
  } catch (error) {
    return null;
  }
}

/**
 * Gets cache info for display
 */
export function getCacheInfo(): {
  exists: boolean;
  isValid: boolean;
  ageMinutes: number | null;
  expiresInMinutes: number | null;
} {
  try {
    const cachedString = localStorage.getItem(CACHE_CONFIG.VALIDATORS_KEY);

    if (!cachedString) {
      return {
        exists: false,
        isValid: false,
        ageMinutes: null,
        expiresInMinutes: null,
      };
    }

    const cachedData: CachedValidatorData = JSON.parse(cachedString);
    const ageInMs = Date.now() - cachedData.timestamp;
    const ageMinutes = Math.floor(ageInMs / 60000);
    const ttlMinutes = Math.floor(CACHE_CONFIG.TTL / 60000);
    const expiresInMinutes = Math.max(0, ttlMinutes - ageMinutes);
    const isValid = isCacheValid(cachedData.timestamp);

    return {
      exists: true,
      isValid,
      ageMinutes,
      expiresInMinutes,
    };
  } catch (error) {
    return {
      exists: false,
      isValid: false,
      ageMinutes: null,
      expiresInMinutes: null,
    };
  }
}
