"use client";

import Link from "next/link";
import type { ExplorerSearchResult } from "@/lib/solana/explorerSearch";

export function ExplorerResultCard({ result }: { result: ExplorerSearchResult }) {
  if (result.kind === "unknown") {
    return (
      <div className="card">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Not recognized
        </div>
        <div className="mt-1 text-sm text-gray-500">{result.reason}</div>
      </div>
    );
  }

  if (result.kind === "tx") {
    return (
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Transaction
            </div>
            <div className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
              {result.signature}
            </div>
          </div>
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              result.found
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
            }`}
          >
            {result.found ? "Found" : "Not found"}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-3">
            <Link
              className="text-sm text-solana-purple hover:underline"
              href={`/tx/${result.signature}`}
            >
              View details
            </Link>

            <a
              className="text-sm text-solana-purple hover:underline"
              href={`https://explorer.solana.com/tx/${result.signature}?cluster=${result.network}`}
              target="_blank"
              rel="noreferrer"
            >
              View on Solana Explorer
            </a>
          </div>
        </div>
      </div>
    );
  }

  // address
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Address
          </div>
          <div className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
            {result.address}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Type: <span className="font-medium">{result.addressType}</span>
          </div>
        </div>
        <div
          className={`text-xs px-2 py-1 rounded-full ${
            result.found
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
          }`}
        >
          {result.found ? "Found" : "Not found"}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          className="text-sm text-solana-purple hover:underline"
          href={`/account/${result.address}`}
        >
          View details
        </Link>

        <a
          className="text-sm text-solana-purple hover:underline"
          href={`https://explorer.solana.com/address/${result.address}?cluster=${result.network}`}
          target="_blank"
          rel="noreferrer"
        >
          View on Solana Explorer
        </a>

        <Link
          className="text-sm text-solana-purple hover:underline"
          href={`/validator/${result.address}`}
        >
          Try as validator address
        </Link>
      </div>
    </div>
  );
}
