"use client";

import { useEffect, useState } from "react";

export function ExplorerSearchBar({
  initialQuery = "",
  onSearch,
}: {
  initialQuery?: string;
  onSearch: (q: string) => void;
}) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = value.trim();
          if (q) onSearch(q);
        }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by address / transaction signature"
          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-solana-purple"
        />
        <button
          type="submit"
          className="btn-primary rounded-xl px-5 py-3"
        >
          Search
        </button>
      </form>
      <p className="mt-2 text-xs text-gray-500">
        Paste a Solana address (base58) or a transaction signature.
      </p>
    </div>
  );
}
