"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { getSolanaBeachHeaders, buildSolanaBeachURL, ENV } from "@/config/env";
import axios from "axios";
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
  // Based on the schema "true | false", this should be a boolean
  delinquent: boolean;
}

// Solana Beach API types
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
  validatorList: CSolanaBeachValidator[]; // The array we want
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

  // Fetch validator metadata from Solana Beach
  const fetchSolanaBeachMetadata = useCallback(async (): Promise<
    Map<string, CSolanaBeachValidator>
  > => {
    try {
      console.log("🌊 Fetching validator metadata from Solana Beach...");

      // 1. Await the Axios call to get the response object
      const response = await axios.get<SolanaBeachValidatorsResponse>( // Use a generic type here
        buildSolanaBeachURL(ENV.SOLANA_BEACH.ENDPOINTS.VALIDATORS),
        { headers: getSolanaBeachHeaders() }
      );

      if (!response.data) {
        console.warn("Failed to fetch from Solana Beach, using fallback data");
        return new Map();
      }

      // 2. Get the full response object from the .data property (NO 'await')
      const fullResponse: SolanaBeachValidatorsResponse = response.data;

      // 3. Extract the actual array of validators
      const validatorsArray: CSolanaBeachValidator[] =
        fullResponse.validatorList;

      const validatorMap = new Map<string, CSolanaBeachValidator>();

      validatorsArray.forEach((validator) => {
        // Use 'votePubkey' as the unique key based on the schema
        validatorMap.set(validator.votePubkey, validator);
      });

      return validatorMap;
    } catch (error) {
      console.warn("⚠️ Failed to fetch Solana Beach metadata:", error);
      return new Map(); // Return empty map as fallback
    }
  }, [validators.length]);

  // Main function to fetch and combine all validator data
  const fetchValidators = useCallback(async () => {
    if (!connection) {
      setError("No connection available");
      return;
    }

    //fetchValid();

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${ENV.BASE_URL}/api/validators`, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": `${ENV.APP.NAME}/${ENV.APP.VERSION}`,
        },
      });

      const validatorsWithImages: ValidatorInfo[] =
        response.data.validators.filter(
          (v: ValidatorInfo) => v.avatar && v.avatar.length > 0
        );

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
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount and when connection changes
  useEffect(() => {
    if (connection) {
      fetchValidators();
    }
  }, [connection, fetchValidators]);

  // Manual refresh function
  const refreshValidators = useCallback(() => {
    fetchValidators();
  }, [fetchValidators]);

  return {
    validators,
    epochDetails,
    loading,
    error,
    stats,
    lastUpdated,
    refreshValidators,
  };
}
