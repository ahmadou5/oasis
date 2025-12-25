"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import {
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  X,
  Hash,
  MapPin,
  Server,
  Command,
  Wallet,
  Coins,
  Shield,
  Zap,
  Settings,
  Image,
  Users,
} from "lucide-react";
import { getEnhancedSmartRoute, type SmartRouteResult } from "@/lib/solana/smartRouter";

// Re-use existing types from the original component
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
  /** Show compact search bar or inline search */
  compactMode?: boolean;
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

// Highlight matching text
function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const normalizedQuery = normalize(query);
  const normalizedText = normalize(text);
  const index = normalizedText.indexOf(normalizedQuery);
  
  if (index === -1) return text;
  
  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);
  
  return (
    <>
      {before}
      <mark className="bg-emerald-200 dark:bg-emerald-800/50 text-emerald-900 dark:text-emerald-200">
        {match}
      </mark>
      {after}
    </>
  );
}

// Helper functions from original component
function safeReadRecent(storageKey: string): ExplorerSearchItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
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

function getItemIcon(item: ExplorerSearchItem, smartRoute?: SmartRouteResult): React.ReactNode {
  if (item.icon) return item.icon;

  // Use smart route info if available
  if (smartRoute) {
    switch (smartRoute.accountType) {
      case "user_wallet":
        return <Wallet className="w-4 h-4 text-blue-400" />;
      case "token_mint":
        return <Coins className="w-4 h-4 text-yellow-400" />;
      case "token_account":
        return <Wallet className="w-4 h-4 text-green-400" />;
      case "stake_account":
        return <Shield className="w-4 h-4 text-purple-400" />;
      case "validator_identity":
      case "validator_vote":
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case "program_account":
      case "program_data":
        return <Settings className="w-4 h-4 text-orange-400" />;
      case "nft_mint":
        return <Image className="w-4 h-4 text-pink-400" />;
      case "multisig_account":
        return <Users className="w-4 h-4 text-indigo-400" />;
      default:
        return <Server className="w-4 h-4 text-gray-400" />;
    }
  }

  // Fallback to original logic
  switch (item.type) {
    case "TX":
      return <Hash className="w-4 h-4 text-gray-400" />;
    case "ADDRESS":
      return <Server className="w-4 h-4 text-gray-400" />;
    case "VALIDATOR":
      return <Zap className="w-4 h-4 text-emerald-400" />;
    case "TOKEN":
    case "LST":
      return <Coins className="w-4 h-4 text-yellow-400" />;
    default:
      return <Search className="w-4 h-4 text-gray-400" />;
  }
}

export function ExplorerSearchCommand({
  placeholder = "Search by address / transaction signature",
  className,
  initialQuery = "",
  onSelect,
  suggestedItems = [],
  maxRecent = 8,
  recentStorageKey = "explorer.recentSearches.v1",
  enableRemoteSearch = true,
  network = "mainnet-beta",
  compactMode = true,
}: Props) {
  const listboxId = useId();
  const inputId = useId();
  const dialogId = useId();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogInputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 200);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [recent, setRecent] = useState<ExplorerSearchItem[]>([]);
  const [remote, setRemote] = useState<ExplorerSearchItem[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [smartRouteCache, setSmartRouteCache] = useState<Map<string, SmartRouteResult>>(new Map());

  // Detect Mac for keyboard shortcuts
  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");

  // Global keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setDialogOpen(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (dialogOpen && dialogInputRef.current) {
      dialogInputRef.current.focus();
    }
  }, [dialogOpen]);

  // Initial recent load
  useEffect(() => {
    setRecent(safeReadRecent(recentStorageKey));
  }, [recentStorageKey]);

  // Remote search effect (same as original)
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
          `/api/search?q=${encodeURIComponent(q)}&network=${encodeURIComponent(network)}`,
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
          | { kind: "address"; address: string; found: boolean; addressType: string }
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
          // Get smart route information for enhanced display
          try {
            const smartRoute = await getEnhancedSmartRoute({ 
              address: json.address, 
              network 
            });
            
            // Cache the smart route result
            setSmartRouteCache(prev => new Map(prev.set(json.address, smartRoute)));
            
            const type: ExplorerSearchItemType = 
              smartRoute.accountType === "validator_identity" || smartRoute.accountType === "validator_vote" 
                ? "VALIDATOR" : "ADDRESS";
                
            setRemote([
              {
                id: `addr:${json.address}`,
                title: smartRoute.displayName,
                subtitle: `${json.address} • ${smartRoute.description}`,
                type,
                value: json.address,
                verified: json.found && smartRoute.confidence > 0.5,
              },
            ]);
          } catch (error) {
            console.error("Smart route classification failed:", error);
            // Fallback to basic classification
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
          }
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
  }, [debouncedQuery, enableRemoteSearch, network]);

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
    const out: Array<{ section: "recent" | "suggested"; item: ExplorerSearchItem }> = [];
    for (const item of filteredRecent) out.push({ section: "recent", item });
    for (const item of filteredSuggested) out.push({ section: "suggested", item });
    return out;
  }, [filteredRecent, filteredSuggested]);

  async function commitSelection(item: ExplorerSearchItem) {
    // For address items, use smart routing
    if (item.type === "ADDRESS" || item.type === "VALIDATOR") {
      try {
        const smartRoute = smartRouteCache.get(item.value) || await getEnhancedSmartRoute({ 
          address: item.value, 
          network 
        });
        
        // Update the item with smart route info
        const enhancedItem = {
          ...item,
          title: smartRoute.displayName,
          subtitle: `${item.subtitle} • ${smartRoute.description}`,
        };

        // Update recents with enhanced item
        setRecent((prev) => {
          const next = [enhancedItem, ...prev.filter((x) => x.id !== item.id)].slice(0, maxRecent);
          safeWriteRecent(recentStorageKey, next);
          return next;
        });

        // Navigate to smart route
        if (smartRoute.shouldRedirect && typeof window !== "undefined") {
          window.location.href = smartRoute.route;
          return;
        }
      } catch (error) {
        console.error("Smart routing failed, falling back to normal routing:", error);
      }
    }

    // Fallback to normal behavior
    setRecent((prev) => {
      const next = [item, ...prev.filter((x) => x.id !== item.id)].slice(0, maxRecent);
      safeWriteRecent(recentStorageKey, next);
      return next;
    });

    onSelect?.(item);
    setDialogOpen(false);
    setActiveIndex(-1);
    setQuery("");
  }

  function closeDialog() {
    setDialogOpen(false);
    setActiveIndex(-1);
  }

  function onDialogKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDialog();
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
        // Fall back: if query exactly matches an item value, choose it
        const q = query.trim();
        const exact = flattened.find((x) => x.item.value === q)?.item;
        if (exact) commitSelection(exact);
      }
      return;
    }
  }

  // Inline search bar component (with dropdown like original)
  const InlineSearchBar = () => {
    const [open, setOpen] = useState(false);

    // Close on outside click
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

    function onInlineKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
          setOpen(false);
        }
        return;
      }
    }

    return (
      <div ref={rootRef} className={clsx("w-full relative", className)}>
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
            onKeyDown={onInlineKeyDown}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-12 py-4 text-sm sm:text-base text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-400/70 transition-shadow"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto z-50">
            {remoteLoading && (
              <div className="p-4 text-gray-400 text-sm">Searching...</div>
            )}

            {remoteError && (
              <div className="p-4 text-red-400 text-sm">{remoteError}</div>
            )}

            {/* Recent Searches */}
            {filteredRecent.length > 0 && (
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Recent Searches
                </div>
                <div className="space-y-1">
                  {filteredRecent.map((item, idx) => {
                    const flatIndex = idx;
                    const active = flatIndex === activeIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          commitSelection(item);
                          setOpen(false);
                        }}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                          active ? "bg-gray-700" : "hover:bg-gray-800"
                        )}
                      >
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">
                            {highlight(item.title, query)}
                          </div>
                          <div className="text-gray-400 text-xs font-mono truncate">
                            {highlight(item.subtitle, query)}
                          </div>
                        </div>
                        {item.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search Results */}
            {filteredSuggested.length > 0 && (
              <div className={clsx("p-4", filteredRecent.length > 0 && "border-t border-gray-800")}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Results
                </div>
                <div className="space-y-1">
                  {filteredSuggested.map((item, idx) => {
                    const flatIndex = filteredRecent.length + idx;
                    const active = flatIndex === activeIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          commitSelection(item);
                          setOpen(false);
                        }}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                          active ? "bg-emerald-900/20 border border-emerald-700/50" : "hover:bg-gray-800"
                        )}
                      >
                        {getItemIcon(item, smartRouteCache.get(item.value))}
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">
                            {highlight(item.title, query)}
                          </div>
                          <div className="text-gray-400 text-xs font-mono truncate">
                            {highlight(item.subtitle, query)}
                          </div>
                        </div>
                        {item.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results */}
            {!remoteLoading && !remoteError && flattened.length === 0 && query && (
              <div className="p-6 text-center">
                <div className="text-gray-400 text-sm">No results found</div>
                <div className="text-gray-500 text-xs mt-1">
                  Try searching for an address or transaction signature
                </div>
              </div>
            )}

            {/* Empty State */}
            {!remoteLoading && !query && flattened.length === 0 && (
              <div className="p-6 text-center">
                <Search className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <div className="text-gray-400 text-sm">Start typing to search</div>
                <div className="text-gray-500 text-xs mt-1">
                  Search addresses, transactions, and more
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Compact search bar component
  const CompactSearchBar = () => (
    <div ref={rootRef} className={clsx("relative", className)}>
      <div
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors duration-200 min-w-[300px]"
      >
        <Search className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400 text-sm flex-1">Search nodes...</span>
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-600">
          {isMac ? <Command className="w-3 h-3" /> : "Ctrl"}
          <span>K</span>
        </div>
      </div>
    </div>
  );

  // Dialog backdrop and content
  const DialogContent = () => (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeDialog();
        }
      }}
    >
      <div
        className="w-full max-w-2xl mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogId}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id={dialogId}
              ref={dialogInputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={onDialogKeyDown}
              placeholder="Search by name, location, or node ID..."
              className="w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-gray-400 text-lg outline-none"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-700 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {remoteLoading && (
            <div className="p-4 text-gray-400 text-sm">Searching...</div>
          )}

          {remoteError && (
            <div className="p-4 text-red-400 text-sm">{remoteError}</div>
          )}

          {/* Recent Searches */}
          {filteredRecent.length > 0 && (
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Recent Searches
              </div>
              <div className="space-y-1">
                {filteredRecent.map((item, idx) => {
                  const flatIndex = idx;
                  const active = flatIndex === activeIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => commitSelection(item)}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                        active ? "bg-gray-700" : "hover:bg-gray-800"
                      )}
                    >
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {item.title}
                        </div>
                        <div className="text-gray-400 text-xs font-mono truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      {item.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Results */}
          {filteredSuggested.length > 0 && (
            <div className="p-4 border-t border-gray-800">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Results
              </div>
              <div className="space-y-1">
                {filteredSuggested.map((item, idx) => {
                  const flatIndex = filteredRecent.length + idx;
                  const active = flatIndex === activeIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => commitSelection(item)}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                        active ? "bg-emerald-900/20 border border-emerald-700/50" : "hover:bg-gray-800"
                      )}
                    >
                      {getItemIcon(item)}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {item.title}
                        </div>
                        <div className="text-gray-400 text-xs font-mono truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      {item.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {!remoteLoading && !remoteError && flattened.length === 0 && query && (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-sm">No results found</div>
              <div className="text-gray-500 text-xs mt-1">
                Try searching for an address or transaction signature
              </div>
            </div>
          )}

          {/* Empty State */}
          {!remoteLoading && !query && flattened.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400 text-sm">Start typing to search</div>
              <div className="text-gray-500 text-xs mt-1">
                Search addresses, transactions, and more
              </div>
            </div>
          )}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="p-3 border-t border-gray-800 bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {compactMode ? <CompactSearchBar /> : <InlineSearchBar />}

      {/* Portal for dialog */}
      {typeof window !== "undefined" && dialogOpen &&
        createPortal(<DialogContent />, document.body)
      }
    </>
  );
}