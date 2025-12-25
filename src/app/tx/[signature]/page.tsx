"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton, SkeletonText } from "@/components/Skeleton";
import { EnhancedTransactionView } from "@/components/Transaction/EnhancedTransactionView";
import type { TransactionDetail } from "@/types/transaction";
import { RefreshCw } from "lucide-react";

export default function TxPage() {
  const params = useParams<{ signature: string }>();
  const signature = params.signature;

  const [data, setData] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tx/enhanced/${encodeURIComponent(signature)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as TransactionDetail;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load transaction");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (signature) load();
    return () => {
      cancelled = true;
    };
  }, [signature]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Transaction Details
        </h1>
        {!loading && data && (
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-2"
          >
            View on Solana Explorer →
          </a>
        )}
      </div>

      <div className="mt-6">
        {loading && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-12 h-12 text-gray-600 animate-spin" />
            </div>
            <div className="text-center text-gray-400 mt-4">Loading transaction details...</div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <div className="text-red-400 text-lg font-semibold">Error</div>
            <div className="text-red-300 mt-2">{error}</div>
            <div className="text-gray-400 text-sm mt-4">
              Signature: <span className="font-mono">{signature}</span>
            </div>
          </div>
        )}

        {!loading && !error && data && <EnhancedTransactionView data={data} />}
      </div>
    </div>
  );
}
