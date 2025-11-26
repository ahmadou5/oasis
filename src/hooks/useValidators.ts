"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { getSolanaBeachHeaders, buildSolanaBeachURL, ENV } from "@/config/env";
import axios from "axios";

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

      console.log(
        `✅ Loaded metadata for ${validators.length} validators from Solana Beach`
      );
      return validatorMap;
    } catch (error) {
      console.warn("⚠️ Failed to fetch Solana Beach metadata:", error);
      return new Map(); // Return empty map as fallback
    }
  }, []);

  // Fetch validator performance data from Solana Beach
  const fetchValidatorPerformance = useCallback(
    async (
      validatorAddress: string
    ): Promise<{
      performanceHistory: SolanaBeachValidatorPerformance[];
      averageApy: number;
      uptime: number;
    }> => {
      try {
        const response = await fetch(
          buildSolanaBeachURL(
            ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_EPOCHS(validatorAddress, 30)
          ),
          {
            headers: getSolanaBeachHeaders(),
          }
        );

        if (!response.ok) {
          return { performanceHistory: [], averageApy: 0, uptime: 0 };
        }

        const epochData: SolanaBeachValidatorPerformance[] =
          await response.json();

        const performanceHistory = epochData.map((epoch) => ({
          ...epoch,
          apy: epoch.apy || 0,
          skipRate: epoch.skipRate || 0,
          credits: epoch.credits || 0,
        }));

        // Calculate average APY
        const validApyData = epochData.filter((e) => e.apy && e.apy > 0);
        const averageApy =
          validApyData.length > 0
            ? validApyData.reduce((sum, e) => sum + (e.apy || 0), 0) /
              validApyData.length
            : 0;

        // Calculate uptime
        const totalEpochs = epochData.length;
        const activeEpochs = epochData.filter(
          (e) => !e.delinquent && (e.credits || 0) > 0
        ).length;
        const uptime = totalEpochs > 0 ? (activeEpochs / totalEpochs) * 100 : 0;

        return { performanceHistory, averageApy, uptime };
      } catch (error) {
        console.warn(
          `⚠️ Failed to fetch performance for ${validatorAddress}:`,
          error
        );
        return { performanceHistory: [], averageApy: 0, uptime: 0 };
      }
    },
    []
  );

  // Calculate APY based on epoch credits (fallback when Solana Beach data unavailable)
  const calculateAPYFromCredits = useCallback(
    (epochCredits: [number, number, number][]): number => {
      if (epochCredits.length < 5) return 0;

      const credits = epochCredits.map(
        ([epoch, credits, prevCredits]) => credits
      );
      const recentCredits = credits.slice(-5);
      const avgCredits =
        recentCredits.reduce((sum, credits) => sum + credits, 0) /
        recentCredits.length;

      // Approximate APY calculation based on network performance
      const baseAPY = 6.5; // Base Solana inflation rate
      const performance = Math.min(avgCredits / 400, 1.2);

      return Number((baseAPY * performance).toFixed(2));
    },
    []
  );

  // Calculate skip rate from epoch credits
  const calculateSkipRate = useCallback(
    (epochCredits: [number, number, number][]): number => {
      if (epochCredits.length < 2) return 0;

      const credits = epochCredits.map(
        ([epoch, credits, prevCredits]) => credits
      );
      const avgCredits =
        credits.reduce((sum, credits) => sum + credits, 0) / credits.length;
      const lowPerformanceThreshold = avgCredits * 0.8;
      const skippedEpochs = credits.filter(
        (credits) => credits < lowPerformanceThreshold
      ).length;

      return Number(((skippedEpochs / credits.length) * 100).toFixed(2));
    },
    []
  );

  // Main function to fetch and combine all validator data
  const fetchValidators = useCallback(async () => {
    if (!connection) {
      setError("No connection available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Starting comprehensive validator data fetch...");

      // Fetch data from both sources in parallel
      const [voteAccounts, beachMetadata] = await Promise.all([
        connection.getVoteAccounts("confirmed"),
        fetchSolanaBeachMetadata(),
      ]);

      console.log(
        `📊 RPC Data: ${voteAccounts.current.length} active, ${voteAccounts.delinquent.length} delinquent validators`
      );

      // Combine current and delinquent validators
      const allVoteAccounts = [
        ...voteAccounts.current.map((account) => ({
          ...account,
          status: "active" as const,
        })),
        ...voteAccounts.delinquent.map((account) => ({
          ...account,
          status: "delinquent" as const,
        })),
      ];

      // Process validators with enhanced metadata
      const processedValidators: ValidatorInfo[] = [];

      // Limit to top 100 validators by stake for performance
      const topValidators = allVoteAccounts
        .sort((a, b) => b.activatedStake - a.activatedStake)
        .slice(0, 100);

      for (const account of topValidators) {
        try {
          // Get enhanced metadata from Solana Beach
          const beachData = beachMetadata.get(account.votePubkey);
          const stakeAmount = account.activatedStake / 1_000_000_000; // Convert lamports to SOL

          // Calculate basic metrics from RPC data
          const rpcApy = calculateAPYFromCredits(account.epochCredits);
          const rpcSkipRate = calculateSkipRate(account.epochCredits);

          // For top 20 validators, fetch detailed performance data
          let performanceData: {
            performanceHistory: SolanaBeachValidatorPerformance[];
            averageApy: number;
            uptime: number;
          } = {
            performanceHistory: [],
            averageApy: rpcApy,
            uptime: account.status === "active" ? 95 : 70,
          };

          if (stakeAmount > 1_000_000) {
            // Only fetch for validators with >1M SOL stake
            performanceData = await fetchValidatorPerformance(
              account.votePubkey
            );
          }

          const validatorInfo: ValidatorInfo = {
            address: account.votePubkey,
            name:
              beachData?.name ||
              `Validator ${account.votePubkey.slice(0, 8)}...`,
            commission: account.commission,
            stake: stakeAmount,
            apy:
              performanceData.averageApy > 0
                ? performanceData.averageApy
                : rpcApy,
            delegatedStake: stakeAmount,
            skipRate: rpcSkipRate,
            dataCenter: "Unknown",
            website: beachData?.name,
            description: "Solana validator node",
            avatar: beachData?.iconUrl,
            status: account.status,
            epochCredits: account.epochCredits
              .map(([epoch, credits]) => credits)
              .slice(-10),
            votingPubkey: account.votePubkey,
            activatedStake: account.activatedStake,
            lastVote: account.lastVote,
            rootSlot: 0,
            // Enhanced metadata
            country: "Globe",
            keybaseUsername: beachData?.name,
            twitterUsername: beachData?.name,
            uptime: performanceData.uptime,
            performanceHistory: performanceData.performanceHistory.map(
              (p: SolanaBeachValidatorPerformance) => ({
                epoch: p.epoch,
                apy: p.apy || 0,
                skipRate: p.skipRate || 0,
                credits: p.credits || 0,
              })
            ),
          };

          processedValidators.push(validatorInfo);
        } catch (error) {
          console.warn(
            `⚠️ Failed to process validator ${account.votePubkey}:`,
            error
          );
          // Continue with other validators
        }
      }

      // Sort by stake amount (descending)
      processedValidators.sort((a, b) => b.stake - a.stake);

      // Calculate statistics
      const activeValidators = processedValidators.filter(
        (v) => v.status === "active"
      );
      const totalStake = processedValidators.reduce(
        (sum, v) => sum + v.stake,
        0
      );
      const averageApy =
        activeValidators.length > 0
          ? activeValidators.reduce((sum, v) => sum + v.apy, 0) /
            activeValidators.length
          : 0;
      const averageCommission =
        processedValidators.length > 0
          ? processedValidators.reduce((sum, v) => sum + v.commission, 0) /
            processedValidators.length
          : 0;

      const validatorStats: ValidatorStats = {
        totalValidators: processedValidators.length,
        activeValidators: activeValidators.length,
        totalStake,
        averageApy,
        averageCommission,
      };

      setValidators(processedValidators);
      setStats(validatorStats);
      setLastUpdated(Date.now());
      setError(null);

      console.log(
        `✅ Successfully processed ${processedValidators.length} validators with enhanced data`
      );
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
  }, [
    connection,
    fetchSolanaBeachMetadata,
    fetchValidatorPerformance,
    calculateAPYFromCredits,
    calculateSkipRate,
  ]);

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
    loading,
    error,
    stats,
    lastUpdated,
    refreshValidators,
  };
}
