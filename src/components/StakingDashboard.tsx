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
import { Connection, PublicKey } from "@solana/web3.js";
import { ENV } from "../config/env";

interface IAuthorized {
  staker: PublicKey;
  withdrawer: PublicKey;
}

/**
 * Defines the lockup conditions for a stake account.
 */
interface ILockup {
  unixTimestamp: number;
  epoch: number;
  custodian: PublicKey;
}

interface IStakeAccountMeta {
  authorized: IAuthorized;
  lockup: ILockup;
}

// Types for staking operations
export interface StakeAccountInfo {
  address: PublicKey;
  balance: number; // in SOL
  status:
    | "activating"
    | "active"
    | "deactivating"
    | "inactive"
    | "uninitialized"
    | "unknown";
  delegatedValidator?: PublicKey;

  activationEpoch?: number;
  deactivationEpoch?: number;
  rentExemptReserve: number;
  creditsObserved: number;
  totalBalance: number;
  meta: IStakeAccountMeta;
  lastUpdateEpoch: number;
}

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

  const fakeUser = new PublicKey(
    "31ZBx7jVsdXgq4qFWYD8jqUau1vAp8rqP1wvPaahjXPv"
  );
  const fetchStakes = async () => {
    try {
      if (connected && publicKey) {
        const stakingAccounts = await getUserStakeAccounts(
          fakeUser,
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

      {/* Stake Accounts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Stake Accounts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stakeAccounts.map((account) => (
            <div key={account.address.toBase58()}>
              <StakeAccountCard
                //key={account.address.toBase58()}
                stakeAccount={account}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
