"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchStakeAccounts } from "@/store/slices/stakingSlice";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletBalance } from "@/components/WalletBalance";
import { StakeAccountCard } from "./StakeAccountCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { Wallet, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { getUserStakeAccounts } from "../lib/utils";
import { Connection } from "@solana/web3.js";
import { ENV } from "../config/env";
import { StakeAccountInfo } from "../lib/services/staking.service";

export function StakingDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { connected, publicKey } = useWallet();
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccountInfo[]>([]);
  const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET, {
    commitment: "confirmed",
  });
  const { totalStaked, totalRewards, loading, error } = useSelector(
    (state: RootState) => state.staking
  );
  const fetchStakes = async () => {
    try {
      if (connected && publicKey) {
        const stakingAccounts = await getUserStakeAccounts(
          publicKey,
          connection
        );
        console.log(stakingAccounts, "sune");
        setStakeAccounts(stakingAccounts);
      }
    } catch (error) {}
  };
  useEffect(() => {
    fetchStakes();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="card text-center py-12">
        <Wallet className="text-solana-gray-600 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
        <p className="text-solana-gray-400 mb-6">
          Connect your wallet to view your staking dashboard and manage your
          stakes.
        </p>
        <WalletMultiButton
          style={{
            backgroundColor: "#16a34a",
            borderRadius: "12px",
            height: "40px",
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-4 md:px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-green-500/20 text-sm"
        />
      </div>
    );
  }

  if (loading && stakeAccounts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-green-500/10 border border-green-500/50 rounded-xl text-center py-12">
        <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">
          Error Loading User Stake Accounts
        </h3>
        <p className="text-solana-gray-400 mb-4">{error}</p>
        <button
          onClick={() => publicKey && fetchStakes()}
          className="bg-red-400/50 py-2 rounded-lg w-full  flex-1"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (stakeAccounts.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/50 rounded-xl text-center py-12">
        <TrendingUp className="text-solana-gray-600 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-4">
          No Active Stakes for {publicKey.toString().slice(0, 8)}
        </h3>
        <p className="text-solana-gray-400 mb-6">
          You don't have any active stake accounts. Start staking to earn
          rewards on your SOL.
        </p>
        <a href="/validators" className="bg-green-700/80 py-2 px-6">
          Browse Validators
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Enhanced Wallet Balance */}
        <WalletBalance
          size="md"
          showLabel={true}
          showRefresh={true}
          className="hover:scale-105 transition-transform duration-200"
        />

        <div className="card bg-gradient-to-br from-solana-purple/20 to-solana-purple/10 border-solana-purple/20 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-sm font-medium mb-1">
                Total Staked
              </p>
              <p className="text-2xl font-bold">{totalStaked.toFixed(2)} SOL</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
              <TrendingUp className="text-solana-purple" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-solana-green/20 to-solana-green/10 border-solana-green/20 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-sm font-medium mb-1">
                Total Rewards
              </p>
              <p className="text-2xl font-bold text-solana-green">
                {totalRewards.toFixed(4)} SOL
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
              <TrendingUp className="text-solana-green" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-solana-blue/20 to-solana-blue/10 border-solana-blue/20 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-sm font-medium mb-1">
                Active Stakes
              </p>
              <p className="text-2xl font-bold">
                {stakeAccounts.filter((a) => a.status === "active").length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
              <Clock className="text-solana-blue" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Stake Accounts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Stake Accounts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stakeAccounts.map((account) => (
            <StakeAccountCard
              key={account.address.toBase58()}
              stakeAccount={account}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
