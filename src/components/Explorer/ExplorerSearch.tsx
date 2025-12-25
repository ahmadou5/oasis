"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

export type ExplorerSearchItemType = "TOKEN" | "LST" | "VALIDATOR" | "ADDRESS" | "TX";

export type ExplorerSearchItem = {
  /** Stable id used for keyboard navigation and localStorage. */
  id: string;
  title: string;
  subtitle: string;
  type: ExplorerSearchItemType;
  /** If present, displays a green VERIFIED badge. */
  verified?: boolean;
  /** Optional icon element. If omitted, a sensible default will be shown. */
  icon?: React.ReactNode;
  /** Raw value to search/navigate to (address/signature/etc.). */
  value: string;
};

type Props = {
  placeholder?: string;
  className?: string;
  /** Initial input value. */
  initialQuery?: string;
  /** Called when the user selects an item (click or Enter). */
  onSelect?: (item: ExplorerSearchItem) => void;
  /** Suggested list shown when the dropdown opens (and filtered by query). */
  suggestedItems?: ExplorerSearchItem[];
  /** Maximum number of recent searches stored. */
  maxRecent?: number;
  /** localStorage key used for recent searches. */
  recentStorageKey?: string;
  /** Enable/disable real-time remote search (defaults to true). */
  enableRemoteSearch?: boolean;
  /** Which network to use for /api/search. */
  network?: "mainnet-beta" | "testnet" | "devnet";
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark
            key={i}
            className="bg-yellow-200/70 dark:bg-yellow-400/20 text-inherit rounded px-0.5"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function defaultTypeBadge(type: ExplorerSearchItemType) {
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200">
      {type}
    </span>
  );
}

function getDefaultIcon(type: ExplorerSearchItemType) {
  switch (type) {
    case "TOKEN":
    case "LST":
      return (
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-gray-600 dark:text-gray-200" />
        </div>
      );
    case "VALIDATOR":
      return (
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-solana-purple" />
        </div>
      );
    case "TX":
    case "ADDRESS":
    default:
      return (
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <Search className="w-5 h-5 text-gray-600 dark:text-gray-200" />
        </div>
      );
  }
}

function safeReadRecent(storageKey: string): ExplorerSearchItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // minimal validation
    return parsed
      .filter(Boolean)
      .map((x: any) => ({
        id: String(x.id),
        title: String(x.title ?? ""),
        subtitle: String(x.subtitle ?? ""),
        type: String(x.type ?? "ADDRESS") as ExplorerSearchItemType,
        verified: !!x.verified,
        value: String(x.value ?? ""),
      }))
      .filter((x) => x.id && x.title && x.value);
  } catch {
    return [];
  }
}

function safeWriteRecent(storageKey: string, items: ExplorerSearchItem[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function ExplorerSearch({
  placeholder = "Search by address / transaction signature",
  className,
  initialQuery = "",
  onSelect,
  suggestedItems = [],
  maxRecent = 8,
  recentStorageKey = "explorer.recentSearches.v1",
  enableRemoteSearch = true,
  network = "mainnet-beta",
}: Props) {
  const listboxId = useId();
  const inputId = useId();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 200);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [recent, setRecent] = useState<ExplorerSearchItem[]>([]);
  const [remote, setRemote] = useState<ExplorerSearchItem[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // initial recent load
  useEffect(() => {
    setRecent(safeReadRecent(recentStorageKey));
  }, [recentStorageKey]);

  // close on outside click
  useEffect(() => {
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  // remote search (best-effort) using existing /api/search
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const q = debouncedQuery.trim();
      if (!enableRemoteSearch || !q) {
        setRemote([]);
        setRemoteError(null);
        setRemoteLoading(false);
        return;
      }

      setRemoteLoading(true);
      setRemoteError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&network=${encodeURIComponent(
            network
          )}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          let msg = `Search failed (${res.status})`;
          try {
            const body = await res.json();
            msg = body?.hint ? `${body.error}: ${body.hint}` : body?.error || msg;
            if (body?.details) msg = `${msg} (${body.details})`;
          } catch {
            // ignore
          }
          setRemote([]);
          setRemoteError(msg);
          return;
        }

        const json = (await res.json()) as
          | { kind: "tx"; signature: string; found: boolean }
          | {
              kind: "address";
              address: string;
              found: boolean;
              addressType: string;
            }
          | { kind: "unknown" };

        if (cancelled) return;

        if (json.kind === "tx") {
          setRemote([
            {
              id: `tx:${json.signature}`,
              title: "Transaction",
              subtitle: json.signature,
              type: "TX",
              value: json.signature,
              verified: json.found,
            },
          ]);
        } else if (json.kind === "address") {
          const t = json.addressType?.toString()?.toUpperCase();
          const type: ExplorerSearchItemType =
            t === "STAKE" ? "ADDRESS" : t === "PROGRAM" ? "ADDRESS" : "ADDRESS";
          setRemote([
            {
              id: `addr:${json.address}`,
              title: "Address",
              subtitle: json.address,
              type,
              value: json.address,
              verified: json.found,
            },
          ]);
        } else {
          setRemote([]);
        }
      } catch (e) {
        if (cancelled) return;
        setRemote([]);
        setRemoteError(
          `We couldn't reach the Solana RPC right now. Please retry. (${String(
            (e as any)?.message ?? e
          )})`
        );
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, enableRemoteSearch, network, retryNonce]);

  const filteredSuggested = useMemo(() => {
    const q = normalize(query);
    const base = [...remote, ...suggestedItems];

    if (!q) return base;

    return base.filter((item) => {
      const hay = `${item.title} ${item.subtitle} ${item.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, suggestedItems, remote]);

  const filteredRecent = useMemo(() => {
    const q = normalize(query);
    if (!q) return recent;
    return recent.filter((item) => {
      const hay = `${item.title} ${item.subtitle} ${item.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, recent]);

  const flattened = useMemo(() => {
    const out: Array<{ section: "recent" | "suggested"; item: ExplorerSearchItem }>
      = [];
    for (const item of filteredRecent) out.push({ section: "recent", item });
    for (const item of filteredSuggested) out.push({ section: "suggested", item });
    return out;
  }, [filteredRecent, filteredSuggested]);

  function commitSelection(item: ExplorerSearchItem) {
    // update recents
    setRecent((prev) => {
      const next = [item, ...prev.filter((x) => x.id !== item.id)].slice(
        0,
        maxRecent
      );
      safeWriteRecent(recentStorageKey, next);
      return next;
    });

    onSelect?.(item);
    setOpen(false);
    setActiveIndex(-1);
  }

  function removeRecent(id: string) {
    setRecent((prev) => {
      const next = prev.filter((x) => x.id !== id);
      safeWriteRecent(recentStorageKey, next);
      return next;
    });
  }

  function clearAllRecent() {
    setRecent([]);
    safeWriteRecent(recentStorageKey, []);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flattened.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const hit = flattened[activeIndex]?.item;
      if (hit) {
        commitSelection(hit);
      } else {
        // fall back: if query exactly matches an item value, choose it
        const q = query.trim();
        const exact = flattened.find((x) => x.item.value === q)?.item;
        if (exact) commitSelection(exact);
      }
      return;
    }
  }

  const showDropdown = open;

  return (
    <div ref={rootRef} className={clsx("w-full", className)}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        />
        <input
          id={inputId}
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          className={clsx(
            "w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white px-12 py-4 text-sm sm:text-base",
            "outline-none focus:ring-2 focus:ring-solana-purple/70",
            "transition-shadow"
          )}
        />
        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setRemote([]);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className={clsx(
            "mt-3 w-full rounded-2xl border border-gray-200 dark:border-gray-700",
            "bg-gray-50/95 dark:bg-gray-900/80 backdrop-blur",
            "shadow-lg",
            "overflow-hidden",
            "animate-fade-in"
          )}
        >
          {/* Recent Searches */}
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 border-b border-dotted border-gray-300 dark:border-gray-700 pb-2 w-full">
                <span>RECENT SEARCHES</span>
              </div>
              <button
                type="button"
                onClick={clearAllRecent}
                className="ml-3 text-xs font-semibold text-solana-purple hover:underline whitespace-nowrap"
                aria-label="Clear all recent searches"
                disabled={recent.length === 0}
              >
                CLEAR
              </button>
            </div>

            <div className="mt-3">
              {filteredRecent.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 pb-3">
                  No recent searches.
                </div>
              ) : (
                <ul
                  role="listbox"
                  aria-label="Recent searches"
                  className="divide-y divide-gray-200/70 dark:divide-gray-700/70"
                >
                  {filteredRecent.map((item, idx) => {
                    const flatIndex = idx;
                    const active = flatIndex === activeIndex;

                    return (
                      <li key={item.id} className="py-1" role="none">
                        <div
                          className={clsx(
                            "w-full flex items-center gap-3 rounded-xl px-2 py-2",
                            "transition-colors",
                            active
                              ? "bg-white dark:bg-gray-800"
                              : "hover:bg-white/70 dark:hover:bg-gray-800/60"
                          )}
                        >
                          <button
                            type="button"
                            id={`${listboxId}-opt-${flatIndex}`}
                            role="option"
                            aria-selected={active}
                            onMouseEnter={() => setActiveIndex(flatIndex)}
                            onFocus={() => setActiveIndex(flatIndex)}
                            onClick={() => commitSelection(item)}
                            className="flex flex-1 min-w-0 items-center gap-3 text-left"
                          >
                            <div className="shrink-0">
                              {item.icon ?? (
                                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {highlight(item.title, query)}
                              </div>
                              <div className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400 truncate">
                                {highlight(item.subtitle, query)}
                              </div>
                            </div>

                            <div className="shrink-0">{defaultTypeBadge(item.type)}</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => removeRecent(item.id)}
                            className="shrink-0 p-2 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700/60 transition"
                            aria-label={`Remove ${item.title} from recent searches`}
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Suggested Search */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 border-b border-dotted border-gray-300 dark:border-gray-700 pb-2 w-full">
                <span>SUGGESTED SEARCH</span>
              </div>
            </div>

            <div className="mt-3">
              {remoteLoading && (
                <div className="text-sm text-gray-500 dark:text-gray-400 pb-2">
                  Searching...
                </div>
              )}

              {remoteError && !remoteLoading && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                  <div className="font-semibold">Search temporarily unavailable</div>
                  <div className="mt-1 text-xs opacity-90 break-words">{remoteError}</div>
                  <button
                    type="button"
                    className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 transition"
                    onClick={() => {
                      setRemoteError(null);
                      setRetryNonce((n) => n + 1);
                    }}
                    aria-label="Retry search"
                  >
                    Retry
                  </button>
                </div>
              )}

              {filteredSuggested.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No suggestions.
                </div>
              ) : (
                <ul
                  id={listboxId}
                  role="listbox"
                  aria-label="Search suggestions"
                  className="divide-y divide-gray-200/70 dark:divide-gray-700/70"
                >
                  {filteredSuggested.map((item, idx) => {
                    const flatIndex = filteredRecent.length + idx;
                    const active = flatIndex === activeIndex;

                    return (
                      <li key={`${item.id}-${idx}`} className="py-1">
                        <button
                          type="button"
                          id={`${listboxId}-opt-${flatIndex}`}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => commitSelection(item)}
                          className={clsx(
                            "w-full flex items-center gap-3 rounded-xl px-2 py-2",
                            "transition-colors",
                            active
                              ? "bg-white dark:bg-gray-800"
                              : "hover:bg-white/70 dark:hover:bg-gray-800/60"
                          )}
                        >
                          <div className="shrink-0">
                            {item.icon ?? getDefaultIcon(item.type)}
                          </div>

                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {highlight(item.title, query)}
                              </div>
                              {item.verified && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  VERIFIED
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400 truncate">
                              {highlight(item.subtitle, query)}
                            </div>
                          </div>

                          <div className="shrink-0">{defaultTypeBadge(item.type)}</div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
