"use client";

import React from "react";
import SolanaPriceCard from "./SolanaPriceCard";
import StakeCard from "./StakeCard";
import TransactionsCard from "./TransactionsCard";
import EpochCard from "./EpochCard";
import { RecentBlocksCard } from "./RecentBlocksCard";

export default function DashboardCards() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-black dark:to-blue-900/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-solana-green via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Solana Network Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time network statistics and validator information
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="space-y-8">
          {/* Top Section - World Map (Full Width) */}

          {/* Middle Section - 4 Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <SolanaPriceCard />
            <StakeCard />
            <TransactionsCard />
            <EpochCard />
          </div>

          {/* Recent Blocks Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentBlocksCard maxBlocks={10} />
            </div>
            <div className="space-y-6">
              {/* Additional stats can go here */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                    <div className="w-6 h-6 bg-white rounded" />
                  </div>
                  <div>
                    <h3 className="font-bold">Network Health</h3>
                    <p className="text-sm text-green-500">Excellent</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cluster Version</span>
                    <span className="font-medium">1.16.18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">RPC Nodes</span>
                    <span className="font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uptime</span>
                    <span className="font-medium text-green-500">99.97%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <div className="w-6 h-6 bg-white rounded" />
                </div>
                <div>
                  <h3 className="font-bold">DeFi TVL</h3>
                  <p className="text-sm text-gray-500">Total Value Locked</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">$4.2B</div>
                <div className="text-sm text-green-500">+12.3% (24h)</div>
                <div className="text-xs text-gray-500">
                  Across 150+ protocols
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg">
                  <div className="w-6 h-6 bg-white rounded" />
                </div>
                <div>
                  <h3 className="font-bold">NFT Volume</h3>
                  <p className="text-sm text-gray-500">24h Trading</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">847K SOL</div>
                <div className="text-sm text-red-500">-5.2% (24h)</div>
                <div className="text-xs text-gray-500">12,847 transactions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
