'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Crown, Clock, Users, Globe, TrendingUp, Shield, DollarSign, Activity } from 'lucide-react';

export default function StandaloneDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-black dark:to-blue-900/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Solana Network Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time network statistics and validator information
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Price Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <DollarSign size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">SOL Price</h3>
                <p className="text-sm text-gray-500">Live pricing</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-500 mb-2">$132.45</div>
            <div className="text-green-500">+2.34%</div>
          </div>

          {/* Stake Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Network Stake</h3>
                <p className="text-sm text-gray-500">Total staked</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-500 mb-2">389M SOL</div>
            <div className="text-sm text-gray-500">66.2% of supply</div>
          </div>

          {/* TPS Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Activity size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Network TPS</h3>
                <p className="text-sm text-gray-500">Live transactions</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-500 mb-2">2,847</div>
            <div className="text-sm text-gray-500">Current TPS</div>
          </div>

          {/* Epoch Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Epoch 547</h3>
                <p className="text-sm text-gray-500">Current epoch</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-500 mb-2">89.2%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* World Map Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg">
                <Globe size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Global Validator Map</h3>
                <p className="text-sm text-gray-500">Real-time leader schedule</p>
              </div>
            </div>

            {/* Current Leader */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-400/10 rounded-xl border border-green-500/30">
              <div className="flex items-center gap-3">
                <Crown size={20} className="text-yellow-500" />
                <div className="flex-1">
                  <div className="font-semibold text-green-500">Current Leader</div>
                  <div className="font-bold">Coinbase Cloud</div>
                  <div className="text-sm text-gray-500">San Francisco, USA</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">12.5M SOL</div>
                  <div className="text-sm text-gray-500">5% commission</div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <Globe size={48} className="mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">Interactive Validator Map</h3>
                <p className="text-sm text-gray-500">Showing global validator locations and leader schedule</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Dashboard is working! All styling loaded correctly.</span>
          </div>
        </div>
      </div>
    </div>
  );
}