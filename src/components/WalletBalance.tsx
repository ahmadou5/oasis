"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateBalance } from "@/store/slices/walletSlice";
import { formatSOL } from "@/utils/formatters";
import { Wallet, RefreshCw, TrendingUp, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

interface WalletBalanceProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showRefresh?: boolean;
}

export function WalletBalance({
  showLabel = true,
  size = "md",
  className,
  showRefresh = true,
}: WalletBalanceProps) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const dispatch = useDispatch<AppDispatch>();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const fetchBalance = useCallback(
    async (showLoading = false) => {
      if (!publicKey || !connected) {
        setBalance(0);
        dispatch(updateBalance(0));
        return;
      }

      if (showLoading) setLoading(true);
      setError("");

      try {
        const balanceInLamports = await connection.getBalance(publicKey);
        const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

        setBalance(balanceInSOL);
        dispatch(updateBalance(balanceInSOL));
        setLastUpdated(Date.now());
      } catch (err) {
        console.error("Error fetching balance:", err);
        setError("Failed to fetch balance");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [publicKey, connected, connection, dispatch]
  );

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!connected || !publicKey) return;

    fetchBalance();

    const interval = setInterval(() => {
      fetchBalance(false); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [publicKey, connected, connection, fetchBalance]);

  // Listen for account changes
  useEffect(() => {
    if (!publicKey) return;

    const subscription = connection.onAccountChange(
      publicKey,
      () => {
        fetchBalance(false); // Silent refresh on account change
      },
      "confirmed"
    );

    return () => {
      connection.removeAccountChangeListener(subscription);
    };
  }, [publicKey, connection, fetchBalance]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "p-3",
          balance: "text-lg",
          label: "text-xs",
          icon: 16,
        };
      case "lg":
        return {
          container: "p-6",
          balance: "text-3xl",
          label: "text-sm",
          icon: 24,
        };
      default:
        return {
          container: "p-4",
          balance: "text-2xl",
          label: "text-sm",
          icon: 20,
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
    if (seconds < 60) return `Updated ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Updated ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `Updated ${hours}h ago`;
  };

  if (!connected) {
    return (
      <div
        className={clsx(
          "card bg-gradient-to-br from-solana-gray-900/50 to-solana-gray-800/50 border-solana-gray-700",
          sizeClasses.container,
          className
        )}
      >
        <div className="flex items-center justify-center gap-3 text-solana-gray-400">
          <Wallet size={sizeClasses.icon} />
          <span className={sizeClasses.label}>
            Connect wallet to view balance
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "card bg-gradient-to-br from-solana-purple/10 to-solana-blue/10 border-solana-purple/20 hover:border-solana-purple/40 transition-all duration-200",
        sizeClasses.container,
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        {showLabel && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-solana-purple/20">
              <Wallet className="text-solana-purple" size={sizeClasses.icon} />
            </div>
            <div>
              <h3
                className={clsx("font-semibold text-white", sizeClasses.label)}
              >
                Wallet Balance
              </h3>
              {lastUpdated && (
                <p className="text-xs text-solana-gray-400">
                  {formatLastUpdated()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 rounded-lg hover:bg-solana-gray-800 transition-colors text-solana-gray-400 hover:text-white"
            title={isVisible ? "Hide balance" : "Show balance"}
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {showRefresh && (
            <button
              onClick={() => fetchBalance(true)}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-solana-gray-800 transition-colors text-solana-gray-400 hover:text-white"
              title="Refresh balance"
            >
              <RefreshCw
                size={16}
                className={clsx(loading && "animate-spin")}
              />
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="text-red-400 text-center py-2">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchBalance(true)}
            className="text-xs text-red-300 hover:text-red-200 mt-1"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div
            className={clsx(
              "font-bold bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent",
              sizeClasses.balance
            )}
          >
            {isVisible ? (
              loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw size={sizeClasses.icon} className="animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                formatSOL(balance)
              )
            ) : (
              "•••• SOL"
            )}
          </div>

          {isVisible && balance > 0 && (
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-solana-gray-400">
              <TrendingUp size={12} />
              <span>Available to stake</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
