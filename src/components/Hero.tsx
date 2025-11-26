"use client";

import Link from "next/link";
import { TrendingUp, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "High Rewards",
    description: "Earn up to 8% APY by staking your SOL tokens",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your funds remain in your control with non-custodial staking",
  },
  {
    icon: Zap,
    title: "Easy to Use",
    description: "Simple interface for seamless staking experience",
  },
];

export function Hero() {
  return (
    <div className="text-center space-y-12 py-2 lg:py-20">
      {/* Hero Content */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Stake Your <span className="gradient-text">SOL</span> and Earn Rewards
        </h1>

        <p className="text-xl text-gray-600 dark:text-solana-gray-300 max-w-2xl mx-auto leading-relaxed">
          Join thousands of SOL holders earning staking rewards on Solana's
          high-performance blockchain. Secure, non-custodial, and optimized for
          maximum returns.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/validators" className="btn-primary">
            Start Staking
          </Link>
          <Link href="/calculator" className="btn-secondary">
            Calculate Rewards
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="card text-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-solana-purple to-solana-green rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-solana-purple/25 transition-shadow duration-200">
              <feature.icon className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-gray-500 dark:text-solana-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-solana-purple/10 to-solana-green/10 dark:from-solana-purple/20 dark:to-solana-green/20 rounded-2xl p-8 border border-solana-purple/20 dark:border-solana-purple/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">400+</div>
            <div className="text-gray-500 dark:text-solana-gray-400 mt-1">
              Active Validators
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">1.2B+</div>
            <div className="text-solana-gray-400 mt-1">SOL Staked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">6.8%</div>
            <div className="text-solana-gray-400 mt-1">Average APY</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">99.9%</div>
            <div className="text-solana-gray-400 mt-1">Network Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
