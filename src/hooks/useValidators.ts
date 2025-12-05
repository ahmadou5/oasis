"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { getSolanaBeachHeaders, buildSolanaBeachURL, ENV } from "@/config/env";
import axios from "axios";
import {
  saveValidatorsToCache,
  loadValidatorsFromCache,
  clearValidatorCache,
  getCacheInfo,
} from "@/utils/validatorCache";

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

interface validatorResponse {
  validators: ValidatorInfo[];
  currentEpochInfo: EpochDetails;
}

interface CSolanaBeachValidator {
  votePubkey: string;
  name: string;
  iconUrl: string;
  version: string;
  activatedStake: number;
  stakeAccounts: number;
  commission: number;
  lastVote: number;
  delinquent: boolean;
}

interface SolanaBeachValidator {
  account: string;
  name?: string;
  website?: string;
  description?: string;
  avatar?: string;
  details?: string;
  location?: string;
  country?: string;
  keybaseUsername?: string;
  twitterUsername?: string;
}

interface SolanaBeachValidatorsResponse {
  averageLastVote: number;
  validatorList: CSolanaBeachValidator[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}

interface SolanaBeachValidatorPerformance {
  epoch: number;
  apy?: number;
  commission?: number;
  skipRate?: number;
  credits?: number;
  uptime?: number;
  activeStake?: number;
  delinquent?: boolean;
}

interface ValidatorStats {
  totalValidators: number;
  activeValidators: number;
  totalStake: number;
  averageApy: number;
  averageCommission: number;
}

export function useValidators() {
  const { connection } = useConnection();
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [epochDetails, setEpochDetails] = useState<EpochDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ValidatorStats>({
    totalValidators: 0,
    activeValidators: 0,
    totalStake: 0,
    averageApy: 0,
    averageCommission: 0,
  });
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Fetch validator metadata from Solana Beach
  const fetchSolanaBeachMetadata = useCallback(async (): Promise<
    Map<string, CSolanaBeachValidator>
  > => {
    try {
      console.log("🌊 Fetching validator metadata from Solana Beach...");

      const response = await axios.get<SolanaBeachValidatorsResponse>(
        buildSolanaBeachURL(ENV.SOLANA_BEACH.ENDPOINTS.VALIDATORS),
        { headers: getSolanaBeachHeaders() }
      );

      if (!response.data) {
        console.warn("Failed to fetch from Solana Beach, using fallback data");
        return new Map();
      }

      const fullResponse: SolanaBeachValidatorsResponse = response.data;
      const validatorsArray: CSolanaBeachValidator[] =
        fullResponse.validatorList;

      const validatorMap = new Map<string, CSolanaBeachValidator>();

      validatorsArray.forEach((validator) => {
        validatorMap.set(validator.votePubkey, validator);
      });

      return validatorMap;
    } catch (error) {
      console.warn("⚠️ Failed to fetch Solana Beach metadata:", error);
      return new Map();
    }
  }, [validators.length]);

  // Main function to fetch and combine all validator data
  const fetchValidators = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!connection) {
        setError("No connection available");
        return;
      }

      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = loadValidatorsFromCache();
        if (cachedData) {
          console.log("📦 Using cached validator data");
          setValidators(cachedData.validators);
          setEpochDetails(cachedData.epochDetails);
          setLastUpdated(cachedData.timestamp);
          setIsFromCache(true);
          setError(null);
          setLoading(false);
          return; // Exit early with cached data
        }
      }

      // If no valid cache or force refresh, fetch from API
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      try {
        console.log("🌐 Fetching fresh validator data from API...");

        const response = await axios.get(`${ENV.BASE_URL}/api/validators`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const validatorsWithImages: ValidatorInfo[] =
          response.data.validators.filter(
            (v: ValidatorInfo) => v.avatar && v.avatar.length > 0
          );

        // Save to cache
        const cached = saveValidatorsToCache(
          validatorsWithImages,
          response.data.currentEpochInfo
        );

        if (cached) {
          console.log("💾 Data saved to cache for future use");
        }

        setValidators(validatorsWithImages);
        setEpochDetails(response.data.currentEpochInfo);
        setLastUpdated(Date.now());
        setError(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch validator data";
        console.error("❌ Validator fetch error:", error);
        setError(errorMessage);

        // If API fails, try to use cached data as fallback
        const cachedData = loadValidatorsFromCache();
        if (cachedData) {
          console.log("⚠️ API failed, using cached data as fallback");
          setValidators(cachedData.validators);
          setEpochDetails(cachedData.epochDetails);
          setLastUpdated(cachedData.timestamp);
          setIsFromCache(true);
          setError(
            errorMessage +
              " (Showing cached data from " +
              new Date(cachedData.timestamp).toLocaleTimeString() +
              ")"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [connection]
  );

  // Auto-fetch on mount and when connection changes
  useEffect(() => {
    if (connection) {
      fetchValidators(false); // Don't force refresh on mount
    }
  }, [connection, fetchValidators]);

  // Manual refresh function (bypasses cache)
  const refreshValidators = useCallback(() => {
    console.log("🔄 Force refreshing validators...");
    fetchValidators(true); // Force refresh
  }, [fetchValidators]);

  // Clear cache function
  const clearCache = useCallback(() => {
    clearValidatorCache();
    console.log("🗑️ Cache cleared, fetching fresh data...");
    fetchValidators(true);
  }, [fetchValidators]);

  // Get cache information
  const cacheInfo = getCacheInfo();

  return {
    validators,
    epochDetails,
    loading,
    error,
    stats,
    lastUpdated,
    refreshValidators,
    clearCache,
    isFromCache,
    cacheInfo,
  };
}
