'use client';

import React from 'react';
import { Shield, Zap, TrendingUp, Network } from 'lucide-react';

export function XandeumHero() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.15),transparent_50%)]"></div>
      
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-300/30 dark:border-blue-600/30 mb-6">
            <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Xandeum Network Analytics</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Xandeum PNodes
            </span>
            <br />
            Analytics Platform
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Explore the most advanced parallel node network. Monitor performance, analyze metrics, 
            and discover optimal staking opportunities in the Xandeum ecosystem.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Secure Staking</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">High Performance</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Real-time Analytics</span>
            </div>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Network className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Parallel Processing
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Advanced parallel node architecture for unprecedented transaction throughput and efficiency.
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Performance Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive metrics and analytics to track node performance and network health.
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Secure Staking
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enterprise-grade security with flexible staking options and transparent reward structures.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}