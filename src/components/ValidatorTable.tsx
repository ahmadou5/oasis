"use client";

import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { formatNumber, formatPercent, formatSOL } from "@/utils/formatters";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import Image from "next/image";

interface ValidatorTableProps {
  validators: ValidatorInfo[];
  onValidatorSelect: (validator: ValidatorInfo) => void;
}

type SortField = "name" | "apy" | "commission" | "stake" | "skipRate";
type SortDirection = "asc" | "desc";

export function ValidatorTable({
  validators,
  onValidatorSelect,
}: ValidatorTableProps) {
  const [sortField, setSortField] = useState<SortField>("apy");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  const sortedValidators = [...validators].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="opacity-40" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="text-solana-purple" />
    ) : (
      <ArrowDown size={14} className="text-solana-purple" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-solana-green";
      case "delinquent":
        return "bg-yellow-400";
      case "inactive":
        return "bg-red-400";
      default:
        return "bg-solana-gray-400";
    }
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-solana-gray-800/50">
            <tr>
              <th className="text-left p-4 font-semibold">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 hover:text-solana-purple transition-colors"
                >
                  Validator
                  {getSortIcon("name")}
                </button>
              </th>
              <th className="text-left p-4 font-semibold">
                <button
                  onClick={() => handleSort("apy")}
                  className="flex items-center gap-2 hover:text-solana-purple transition-colors"
                >
                  APY
                  {getSortIcon("apy")}
                </button>
              </th>
              <th className="text-left p-4 font-semibold">
                <button
                  onClick={() => handleSort("commission")}
                  className="flex items-center gap-2 hover:text-solana-purple transition-colors"
                >
                  Commission
                  {getSortIcon("commission")}
                </button>
              </th>
              <th className="text-left p-4 font-semibold">
                <button
                  onClick={() => handleSort("stake")}
                  className="flex items-center gap-2 hover:text-solana-purple transition-colors"
                >
                  Total Stake
                  {getSortIcon("stake")}
                </button>
              </th>
              <th className="text-left p-4 font-semibold">
                <button
                  onClick={() => handleSort("skipRate")}
                  className="flex items-center gap-2 hover:text-solana-purple transition-colors"
                >
                  Skip Rate
                  {getSortIcon("skipRate")}
                </button>
              </th>
              <th className="text-left p-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedValidators.map((validator, index) => (
              <tr
                key={validator.address}
                className={clsx(
                  "border-t border-solana-gray-800 hover:bg-solana-gray-800/30 transition-colors",
                  index % 2 === 0 && "bg-solana-gray-900/20"
                )}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {validator.avatar ? (
                      <Image
                        src={validator.avatar}
                        alt={validator.name}
                        className="w-10 h-10 rounded-full bg-solana-gray-800"
                        height={10}
                        width={10}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center text-sm font-bold">
                        {validator.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{validator.name}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={clsx(
                            "w-2 h-2 rounded-full",
                            getStatusColor(validator.status)
                          )}
                        ></span>
                        <span className="text-solana-gray-400 capitalize">
                          {validator.status}
                        </span>
                        {validator.website && (
                          <a
                            href={validator.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-solana-gray-400 hover:text-white transition-colors"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-solana-green font-semibold text-lg">
                    {formatPercent(validator.apy)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-medium">
                    {formatPercent(validator.commission)}
                  </span>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">
                      {formatSOL(validator.stake)}
                    </div>
                    <div className="text-sm text-solana-gray-400">
                      {formatNumber(validator.stake / 1000000)} M SOL
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={clsx(
                      "font-medium",
                      validator.skipRate > 5
                        ? "text-red-400"
                        : validator.skipRate > 2
                        ? "text-yellow-400"
                        : "text-solana-green"
                    )}
                  >
                    {formatPercent(validator.skipRate)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onValidatorSelect(validator)}
                      className="btn-primary text-sm px-3 py-2"
                    >
                      Stake
                    </button>
                    <a
                      href={`/validator/${validator.address}`}
                      className="btn-secondary text-sm px-3 py-2"
                    >
                      Details
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
