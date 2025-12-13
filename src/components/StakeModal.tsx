"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  StakeProgram,
  Authorized,
  Lockup,
  LAMPORTS_PER_SOL,
  Connection,
} from "@solana/web3.js";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { addTransaction } from "@/store/slices/stakingSlice";
import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  formatSOL,
  validateSOLAmount,
  calculateRewards,
} from "@/utils/formatters";
import {
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  Info,
  Calculator,
} from "lucide-react";
import Image from "next/image";
import { ENV } from "../config/env";

import { useTheme } from "../context/ThemeContext";

interface StakeModalProps {
  validator: ValidatorInfo;
  onClose: () => void;
}

export function StakeModal({ validator, onClose }: StakeModalProps) {
  const { theme } = useTheme();
  const { publicKey, signTransaction } = useWallet();
  const connection = new Connection(ENV.SOLANA.RPC_ENDPOINTS.MAINNET, {
    commitment: "confirmed",
  });
  const dispatch = useDispatch<AppDispatch>();

  const [stakeAmount, setStakeAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [estimatedRewards, setEstimatedRewards] = useState(0);

  // Use the wallet balance hook
  const { balance, refreshBalance } = useWalletBalance();

  useEffect(() => {
    if (stakeAmount) {
      const validation = validateSOLAmount(stakeAmount, balance);
      if (validation.isValid && validation.amount) {
        setEstimatedRewards(
          calculateRewards(validation.amount, validator.apy, 365)
        ); // Annual rewards
      } else {
        setEstimatedRewards(0);
      }
    }
  }, [stakeAmount, balance, validator.apy]);

  const handleStake = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your wallet");
      return;
    }

    const validation = validateSOLAmount(stakeAmount, balance);
    if (!validation.isValid) {
      setError(validation.error || "Invalid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const stakeAmountLamports = validation.amount! * LAMPORTS_PER_SOL;

      // Create stake account keypair (you might want to derive this deterministically)
      const stakeAccount = PublicKey.unique();

      // Get minimum rent exemption for stake account
      const rentExemption = await connection.getMinimumBalanceForRentExemption(
        StakeProgram.space
      );

      // Total amount needed (stake + rent exemption)
      const totalAmountLamports = stakeAmountLamports + rentExemption;

      if (totalAmountLamports > balance * LAMPORTS_PER_SOL) {
        throw new Error(
          `Insufficient funds. Need ${formatSOL(
            totalAmountLamports / LAMPORTS_PER_SOL
          )} including rent exemption.`
        );
      }

      // Create validator vote account public key
      const voteAccount = new PublicKey(validator?.address);

      // Create stake account creation instruction
      const createStakeAccountIx = StakeProgram.createAccount({
        fromPubkey: publicKey,
        stakePubkey: stakeAccount,
        authorized: new Authorized(publicKey, publicKey),
        lockup: new Lockup(0, 0, publicKey),
        lamports: totalAmountLamports,
      });

      // Create delegate instruction
      const delegateIx = StakeProgram.delegate({
        stakePubkey: stakeAccount,
        authorizedPubkey: publicKey,
        votePubkey: voteAccount,
      });

      // Create transaction
      const transaction = new Transaction();
      transaction.add(createStakeAccountIx);
      transaction.add(delegateIx);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      setTxSignature(signature);
      setSuccess(true);

      // Add transaction to Redux store
      dispatch(
        addTransaction({
          signature,
          type: "delegate",
          amount: validation.amount!,
          validatorAddress: validator.address,
          validatorName: validator.name,
          status: "confirmed",
          timestamp: Date.now(),
        })
      );

      // Refresh balance
      refreshBalance();
    } catch (error) {
      console.error("Staking error:", error);
      setError(error instanceof Error ? error.message : "Failed to stake SOL");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    if (balance > 0.01) {
      // Keep some SOL for fees
      setStakeAmount((balance - 0.01).toFixed(3));
    }
  };

  const validation = validateSOLAmount(stakeAmount, balance);

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className={`justify-between bg-gradient-to-r from-green-600/20 ${
            theme === "dark" ? "to-gray-950" : "to-gray-300"
          }  rounded-xl p-6 max-w-lg w-full border border-green-500/50`}
        >
          <div className="text-center">
            <CheckCircle className="text-solana-green mx-auto mb-4" size={64} />
            <h2 className="text-2xl text-white/50 dark:text-gray-800/50 font-bold mb-4">
              Staking Successful!
            </h2>
            <p className="text-white/50 dark:text-gray-800/50 mb-6">
              You've successfully staked {formatSOL(parseFloat(stakeAmount))}{" "}
              with {validator.name}
            </p>

            <div className="bg-solana-gray-800/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-solana-gray-400">Transaction:</span>
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500/80 hover:text-green-500 font-mono text-sm"
                >
                  {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-solana-gray-400">
                  Estimated Annual Rewards:
                </span>
                <span className="text-solana-green font-semibold">
                  {formatSOL(estimatedRewards)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-red-400/50 py-2 rounded-lg w-full  flex-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0">
      <div
        className={`justify-between bg-gradient-to-r from-green-600/20 ${
          theme === "dark" ? "to-gray-950" : "to-gray-300"
        }  rounded-xl p-6 max-w-lg w-full border border-green-500/50`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Stake SOL</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-green-800/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Validator Info */}
        <div className=" rounded-xl border border-green-500/50 bg-green-500/10 p-4 mb-6">
          <div className="flex items-center gap-3">
            {validator.avatar ? (
              <Image
                src={validator.avatar}
                alt={validator.name}
                className="w-12 h-12 rounded-full"
                height={12}
                width={12}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center font-bold">
                {validator.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold">{validator.name}</h3>
              <div className="flex items-center gap-4 text-sm text-solana-gray-400">
                <span>
                  APY:{" "}
                  <span className="text-solana-green font-medium">
                    {validator.apy.toFixed(2)}%
                  </span>
                </span>
                <span>
                  Commission:{" "}
                  <span className="font-medium">{validator.commission}%</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stake Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-solana-gray-300 mb-2">
              Amount to Stake (SOL)
            </label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                className="bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 w-48 lg:w-auto transition"
                step="0.001"
                min="0"
              />
              <button
                onClick={handleMaxAmount}
                className="absolute bg-green-600/10 rounded-xl py-2 px-8 right-3 top-1/2 transform  -translate-y-1/2 text-sm text-green-500/80 border border-green-500/50 hover:text-green-500/90 font-medium"
              >
                MAX
              </button>
            </div>

            {publicKey && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-solana-gray-400">
                  Available: {formatSOL(balance)}
                </span>
                {!validation.isValid && stakeAmount && (
                  <span className="text-red-400">{validation.error}</span>
                )}
              </div>
            )}
          </div>

          {/* Rewards Estimate */}
          {validation.isValid && validation.amount && (
            <div className="bg-solana-blue/10 border border-solana-blue/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calculator className="text-solana-blue mt-0.5" size={16} />
                <div className="flex-1">
                  <div className="font-medium mb-2">Estimated Rewards</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-solana-gray-400">Monthly:</span>
                      <span className="ml-2 text-solana-green font-medium">
                        {formatSOL(estimatedRewards / 12)}
                      </span>
                    </div>
                    <div>
                      <span className="text-solana-gray-400">Annual:</span>
                      <span className="ml-2 text-solana-green font-medium">
                        {formatSOL(estimatedRewards)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-yellow-400 mt-0.5" size={16} />
              <div className="text-sm">
                <div className="font-medium mb-1">Important Information:</div>
                <ul className="text-solana-gray-400 space-y-1">
                  <li>• Stakes take 1-2 epochs to become active (~2-4 days)</li>
                  <li>• Unstaking also takes 1-2 epochs to complete</li>
                  <li>
                    • A small amount of SOL is required for the stake account
                    rent
                  </li>
                  <li>• Rewards are automatically added to your stake</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-400" size={16} />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="bg-red-400/50 py-2 rounded-lg flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleStake}
              disabled={!validation.isValid || loading || !publicKey}
              className="bg-green-600/60 rounded-lg flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Delegating...
                </>
              ) : (
                "Delegate SOL"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
