"use client";

import React from "react";
import SolanaPriceCard from "../SolanaPriceCard";
import EpochCard from "../EpochCard";
import TransactionsCard from "../TransactionsCard";
import { RecentBlocksCard } from "../RecentBlocksCard";

export default function DashboardStats() {
  return (
    <div className="w-full px-4 py-6">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Price & Epoch */}
        <div className="lg:col-span-1 space-y-6">
          <SolanaPriceCard />
          <EpochCard />
        </div>

        {/* Right Column - Transactions (spans 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <TransactionsCard />
          <RecentBlocksCard />
        </div>
      </div>
    </div>
  );
}

// Alternative: Side-by-side 50/50 layout (your original structure)
export function DashboardStatsAlternative() {
  return (
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side */}
        <div className="space-y-6">
          <SolanaPriceCard />
          <EpochCard />
        </div>

        {/* Right Side */}
        <div>
          <TransactionsCard />
          <RecentBlocksCard />
        </div>
      </div>
    </div>
  );
}

// Alternative: All in one row for wide screens
export function DashboardStatsWide() {
  return (
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <SolanaPriceCard />
        <EpochCard />
        <TransactionsCard />
      </div>
    </div>
  );
}
