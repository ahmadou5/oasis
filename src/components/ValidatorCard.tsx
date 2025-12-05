"use client";

import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { formatNumber, formatPercent, formatSOL } from "@/utils/formatters";
import { TrendingUp, Shield, Globe, ExternalLink } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";

interface ValidatorCardProps {
  validator: ValidatorInfo;
  onSelect: () => void;
}

export function ValidatorCard({ validator, onSelect }: ValidatorCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-solana-green";
      case "delinquent":
        return "text-yellow-400";
      case "inactive":
        return "text-red-400";
      default:
        return "text-solana-gray-400";
    }
  };

  const router = useRouter();

  return (
    <div className="card group hover:border-solana-purple/50 transition-all duration-200 cursor-pointer">
      <div onClick={onSelect} className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {validator.avatar ? (
              <Image
                src={validator.avatar}
                alt={validator.name}
                className="w-12 h-12 rounded-full bg-solana-gray-800"
                height={12}
                width={12}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {validator.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg group-hover:text-solana-purple transition-colors">
                {validator.name}
              </h3>
              <div
                className={clsx(
                  "text-sm capitalize",
                  getStatusColor(validator.status)
                )}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
                {validator.status}
              </div>
            </div>
          </div>

          {validator.website && (
            <a
              href={validator.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-solana-gray-400 hover:text-white transition-colors p-1"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Description */}
        {validator.description && (
          <p className="text-solana-gray-400 text-sm line-clamp-2">
            {validator.description}
          </p>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 text-solana-gray-400 text-xs mb-1">
              <TrendingUp size={12} />
              APY
            </div>
            <div className="text-lg font-semibold text-solana-green">
              {formatPercent(validator.apy)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-solana-gray-400 text-xs mb-1">
              <Shield size={12} />
              Commission
            </div>
            <div className="text-lg font-semibold">
              {formatPercent(validator.commission)}
            </div>
          </div>

          <div>
            <div className="text-solana-gray-400 text-xs mb-1">Total Stake</div>
            <div className="text-sm font-medium">
              {formatSOL(validator.stake)}
            </div>
          </div>

          <div>
            <div className="text-solana-gray-400 text-xs mb-1">Skip Rate</div>
            <div className="text-sm font-medium">
              {formatPercent(validator.skipRate)}
            </div>
          </div>
        </div>

        {/* Data Center */}
        <div className="flex items-center gap-2 text-sm text-solana-gray-400 pt-2 border-t border-solana-gray-800">
          <Globe size={14} />
          <span>{validator.dataCenter}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-solana-gray-800 flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 btn-primary text-sm py-2 group-hover:shadow-lg group-hover:shadow-solana-purple/25 transition-shadow duration-200"
        >
          Stake SOL
        </button>
        <Link
          href={`/validator/${validator.address}`}
          className="btn-secondary text-sm py-2 px-4"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
