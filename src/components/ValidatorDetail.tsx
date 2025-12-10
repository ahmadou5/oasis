"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { ValidatorPerformanceChart } from "./ValidatorPerformanceChart";
import { StakeModal } from "./StakeModal";
import { LoadingSpinner } from "./LoadingSpinner";

import {
  Globe,
  ExternalLink,
  Award,
  TrendingUp,
  Users,
  MapPin,
  Twitter,
  Key,
  Copy,
  CheckCircle,
} from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { AppDispatch } from "../store";
import { useValidators } from "../hooks/useValidators";
import { ValidatorInfo } from "../store/slices/validatorSlice";
import { formatAddress, formatPercent, formatSOL } from "../utils/formatters";

interface ValidatorDetailProps {
  validatorAddress: string;
}

export function ValidatorDetail({ validatorAddress }: ValidatorDetailProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(true);
  const { validators: valid, refreshValidators } = useValidators();
  const [validator, setValidator] = useState<ValidatorInfo | null>(null);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadValidator = async () => {
      setLoading(true);
      try {
        const found = valid.find((v) => v.address === validatorAddress);
        setValidator(found || null);
        setLoading(false);
      } catch (error) {
        console.error("Error loading validator:", error);
      } finally {
        setLoading(false);
      }
    };
    loadValidator();
  }, [dispatch, valid, validatorAddress]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(validatorAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  if (loading && !validator) {
    return (
      <div className="flex justify-center mt-20 py-12 space-y-8">
        <LoadingSpinner size="lg" />l
      </div>
    );
  }

  if (!validator) {
    return (
      <div className="card text-center space-y-8 py-12">
        <div className="text-red-400 mb-4">
          <Award size={48} className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Validator Not Found</h3>
          <p className="text-solana-gray-400">
            The validator with address {formatAddress(validatorAddress)} could
            not be found.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-solana-green bg-solana-green/20";
      case "delinquent":
        return "text-yellow-400 bg-yellow-400/20";
      case "inactive":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-solana-gray-400 bg-solana-gray-400/20";
    }
  };

  // normalize validator to the shape expected by ValidatorPerformanceChart
  const updatedValidator = {
    ...validator,
    performanceHistory:
      validator.performanceHistory?.map((h) => ({
        epoch: h.epoch,
        activeStake:
          // older ValidatorInfo entries may not have activeStake
          (h as any).activeStake ?? 0,
        activeStakeAccounts:
          // older ValidatorInfo entries may not have activeStakeAccounts
          (h as any).activeStakeAccounts ?? 0,
        skipRate: h.skipRate,
        credits: h.credits,
        apy: h.apy,
      })) ?? [],
  };

  return (
    <div className="space-y-8 py-16">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Validator Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-6">
              {validator.avatar ? (
                <Image
                  src={validator.avatar}
                  alt={validator.name}
                  className="w-16 h-16 rounded-full bg-solana-gray-800"
                  height={16}
                  width={16}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center text-2xl font-bold">
                  {validator.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{validator.name}</h1>

                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={clsx(
                      "px-3 py-1 rounded-full text-sm font-medium capitalize",
                      getStatusColor(validator.status)
                    )}
                  >
                    {validator.status}
                  </span>

                  {validator.country && (
                    <div className="flex items-center gap-1 text-solana-gray-400">
                      <MapPin size={14} />
                      <span className="text-sm">{validator.country}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-solana-gray-400 text-sm font-mono">
                    {formatAddress(validator.address, 8)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 rounded hover:bg-solana-gray-800 transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCircle className="text-solana-green" size={16} />
                    ) : (
                      <Copy
                        className="text-solana-gray-400 hover:text-white"
                        size={16}
                      />
                    )}
                  </button>
                </div>

                {validator.description && (
                  <p className="text-solana-gray-400 mb-4">
                    {validator.description}
                  </p>
                )}

                {/* Social Links */}
                <div className="flex items-center gap-3">
                  {validator.website && (
                    <a
                      href={validator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-solana-gray-400 hover:text-white transition-colors"
                    >
                      <Globe size={16} />
                      <span className="text-sm">Website</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  {validator.twitterUsername && (
                    <a
                      href={`https://twitter.com/${validator.twitterUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-solana-gray-400 hover:text-white transition-colors"
                    >
                      <Twitter size={16} />
                      <span className="text-sm">Twitter</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  {validator.keybaseUsername && (
                    <a
                      href={`https://keybase.io/${validator.keybaseUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-solana-gray-400 hover:text-white transition-colors"
                    >
                      <Key size={16} />
                      <span className="text-sm">Keybase</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col justify-center">
            <button
              onClick={() => setShowStakeModal(true)}
              className="btn-primary text-lg px-8 py-4 mb-4"
            >
              Stake with {validator.name}
            </button>

            <a
              href={`https://explorer.solana.com/address/${validator.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center flex items-center justify-center gap-2"
            >
              View on Explorer
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-solana-gray-800">
          <div>
            <div className="flex items-center gap-2 text-solana-gray-400 text-sm mb-1">
              <TrendingUp size={14} />
              APY
            </div>
            <div className="text-2xl font-bold text-solana-green">
              {formatPercent(validator.apy)}
            </div>
          </div>

          <div>
            <div className="text-solana-gray-400 text-sm mb-1">Commission</div>
            <div className="text-2xl font-bold">
              {formatPercent(validator.commission)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-solana-gray-400 text-sm mb-1">
              <Users size={14} />
              Total Stake
            </div>
            <div className="text-2xl font-bold">
              {formatSOL(validator.stake)}
            </div>
          </div>

          <div>
            <div className="text-solana-gray-400 text-sm mb-1">Skip Rate</div>
            <div
              className={clsx(
                "text-2xl font-bold",
                validator.skipRate > 5
                  ? "text-red-400"
                  : validator.skipRate > 2
                  ? "text-yellow-400"
                  : "text-solana-green"
              )}
            >
              {formatPercent(validator.skipRate)}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <ValidatorPerformanceChart validator={validator} />

      {/* Stake Modal */}
      {showStakeModal && (
        <StakeModal
          validator={validator}
          onClose={() => setShowStakeModal(false)}
        />
      )}
    </div>
  );
}
