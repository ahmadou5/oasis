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

export function ValidatorTrendCard({
  validator,
  onSelect,
}: ValidatorCardProps) {
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

  return (
    <div className="w-auto h-8 flex flex-col text-white justify-between items-center px-2">
      <div className="flex items-center gap-3">
        {validator?.avatar ? (
          <Image
            src={validator.avatar}
            alt={validator.name}
            className="w-8 h-8 rounded-full bg-solana-gray-800/0"
            height={12}
            width={12}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {validator?.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-sm py-1 transition-colors">
            {validator?.name}
          </h3>
          <div
            className={clsx(
              "text-sm capitalize",
              getStatusColor(validator?.status)
            )}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex flex-row space-x-4">
        <div>
          <div className="text-lg font-semibold text-solana-green">
            {formatPercent(validator?.apy)}
          </div>
        </div>
      </div>
    </div>
  );
}
