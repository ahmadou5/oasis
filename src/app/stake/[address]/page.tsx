"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/Skeleton";
import { StakeDetailsView } from "@/components/Stake/StakeDetailsView";
import type { StakeAccountDetails } from "@/lib/solana/stakeDetails";

export default function StakePage() {
  const params = useParams<{ address: string }>();
  const address = params.address;

  const [data, setData] = useState<StakeAccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/stake/${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as StakeAccountDetails;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load stake account");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (address) load();
    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          🔒
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Stake Account
        </h1>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <Skeleton width="w-1/3" height="h-6" />
            <div className="mt-4 grid gap-4">
              <Skeleton height="h-12" />
              <Skeleton height="h-8" />
              <Skeleton height="h-8" />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <Skeleton width="w-1/4" height="h-6" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="h-16" />
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
          <div className="text-red-400 text-lg font-semibold">Error</div>
          <div className="text-red-300 mt-2">{error}</div>
        </div>
      )}

      {!loading && !error && data && <StakeDetailsView data={data} />}
    </div>
  );
}