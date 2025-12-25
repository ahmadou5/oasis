"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExplorerSearchCommand, type ExplorerSearchItem } from "@/components/Explorer/ExplorerSearchCommand";
import { ExplorerResultCard } from "@/components/Explorer/ExplorerResultCard";
import type { ExplorerSearchResult } from "@/lib/solana/explorerSearch";
import { SkeletonCard } from "@/components/Skeleton";

export default function ExplorerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") || "").trim();

  const [result, setResult] = useState<ExplorerSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(
    async (query: string) => {
      router.push(`/explorer?q=${encodeURIComponent(query)}`);
    },
    [router]
  );

  const suggestedItems = useMemo<ExplorerSearchItem[]>(
    () => [
      {
        id: "token:wrapped-sol",
        title: "Wrapped SOL (SOL)",
        subtitle: "So11111111111111111111111111111111111111112",
        type: "TOKEN",
        value: "So11111111111111111111111111111111111111112",
        verified: true,
      },
      {
        id: "validator:helius",
        title: "Helius Validator",
        subtitle: "(Search validator identity / vote address)",
        type: "VALIDATOR",
        value: "Helius Validator",
        verified: true,
      },
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchResult() {
      if (!q) {
        setResult(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const json = (await res.json()) as ExplorerSearchResult;
        if (!cancelled) setResult(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Search failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResult();
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Explorer Search
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Search Solana addresses and transaction signatures.
      </p>

      <div className="mt-6">
        <ExplorerSearchCommand
          initialQuery={q}
          suggestedItems={suggestedItems}
          compactMode={false}
          onSelect={(item) => {
            // Route to explorer search for addresses/tx; for custom suggestions we just search by value.
            runSearch(item.value);
          }}
        />
      </div>

      <div className="mt-8">
        {loading && (
          <div className="py-6">
            <div className="grid gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="card">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Search error
            </div>
            <div className="mt-1 text-sm text-gray-500">{error}</div>
          </div>
        )}

        {!loading && !error && result && <ExplorerResultCard result={result} />}

        {!loading && !error && !result && (
          <div className="card">
            <div className="text-sm text-gray-500">
              Enter an address or signature to begin.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
