"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Coins,
  Shield,
  TrendingUp,
  Users,
  Award,
  ExternalLink,
  ArrowRight,
  Calculator,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
  Globe,
  Lock,
  Unlock,
  Info,
  MapPin,
  Zap,
  Activity,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { CustomAccordion } from "@/components/CustomAccordion";

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}> = ({ icon, title, description, highlight = false }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
        highlight
          ? "bg-gradient-to-br from-solana-green/10 to-emerald-400/10 border-solana-green/30 shadow-lg shadow-solana-green/20"
          : "bg-white/80 dark:bg-gray-800/80 border-gray-200/20 dark:border-gray-700/20 hover:border-solana-green/30"
      }`}
    >
      <div
        className={`p-3 rounded-lg mb-4 inline-block ${
          highlight
            ? "bg-gradient-to-r from-solana-green to-emerald-400 shadow-lg"
            : "bg-gray-100 dark:bg-gray-700"
        }`}
      >
        <div className={highlight ? "text-white" : "text-solana-green"}>
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const StepCard: React.FC<{
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}> = ({ step, title, description, isLast = false }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 bg-gradient-to-r from-solana-green to-emerald-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
        {step}
      </div>
      {!isLast && (
        <div className="w-0.5 h-16 bg-gradient-to-b from-solana-green to-emerald-400 mt-2" />
      )}
    </div>
    <div className="pb-8">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

export default function LearnPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30 dark:from-gray-900 dark:via-black dark:to-green-900/10">
      <div className="w-full mx-auto px-4 py-8 space-y-12">
        {/* Hero Section - Premium Design */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden animate-fade-in">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-solana-green/20 via-emerald-400/10 to-green-500/20" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,241,149,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,241,149,0.03)_1px,transparent_1px)] bg-[size:64px_64px] animate-pulse" />
            <div
              className="absolute top-20 -left-20 w-72 h-72 bg-solana-green/20 rounded-full blur-3xl animate-bounce"
              style={{ animationDelay: "0s", animationDuration: "6s" }}
            />
            <div
              className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-bounce"
              style={{ animationDelay: "2s", animationDuration: "8s" }}
            />
          </div>

          <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
            {/* Floating Elements */}
            <div className="absolute -top-10 left-10 hidden lg:block">
              <div className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-solana-green/20 animate-float">
                <div className="flex items-center gap-2 text-sm font-medium text-solana-green">
                  <TrendingUp size={16} />
                  <span>6-8% APY</span>
                </div>
              </div>
            </div>

            <div className="absolute -top-16 right-16 hidden lg:block">
              <div className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-400/20 animate-float-delay">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-500">
                  <Shield size={16} />
                  <span>Secure Network</span>
                </div>
              </div>
            </div>

            <div className="absolute top-32 -left-8 hidden lg:block">
              <div className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-400/20 animate-float-reverse">
                <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                  <Users size={16} />
                  <span>No Lock-up</span>
                </div>
              </div>
            </div>

            {/* Central Icon with Pulse Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-solana-green to-emerald-400 rounded-full blur-xl opacity-60 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-r from-solana-green via-emerald-400 to-green-500 rounded-full shadow-2xl border-4 border-white/20">
                  <BookOpen size={56} className="text-white drop-shadow-lg" />
                </div>
                {/* Orbital rings */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-solana-green/30 animate-spin-slow"
                  style={{
                    width: "120px",
                    height: "120px",
                    top: "-10px",
                    left: "-10px",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full border border-emerald-400/20 animate-spin-reverse"
                  style={{
                    width: "140px",
                    height: "140px",
                    top: "-20px",
                    left: "-20px",
                  }}
                />
              </div>
            </div>

            {/* Enhanced Typography */}
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-solana-green/10 border border-solana-green/30 rounded-full text-solana-green font-medium text-sm mb-4">
                <div className="w-2 h-2 bg-solana-green rounded-full animate-pulse" />
                Educational Resource
              </div>

              <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                <span className="block bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                  Master
                </span>
                <span className="block bg-gradient-to-r from-solana-green via-emerald-400 to-green-500 bg-clip-text text-transparent mt-2">
                  Solana Staking
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-light max-w-3xl mx-auto">
                Unlock the potential of your SOL tokens with our comprehensive
                staking guide.
                <span className="font-semibold text-solana-green">
                  {" "}
                  Learn, stake, and earn{" "}
                </span>
                with confidence.
              </p>

              {/* Stats Row */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-12 pt-8 border-t border-gray-200/20 dark:border-gray-700/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-solana-green">
                    500+
                  </div>
                  <div className="text-sm text-gray-500">Active Validators</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-500">
                    6-8%
                  </div>
                  <div className="text-sm text-gray-500">Annual Rewards</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">2-3</div>
                  <div className="text-sm text-gray-500">Days Unstaking</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                <a
                  href="#faq"
                  className="group relative px-8 py-4 bg-gradient-to-r from-solana-green to-emerald-400 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-solana-green/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    <span>Start Learning</span>
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </div>
                </a>

                <a
                  href="/validators"
                  className="group px-8 py-4 border-2 border-solana-green/30 text-solana-green hover:bg-solana-green hover:text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users size={20} />
                    <span>Browse Validators</span>
                  </div>
                </a>
              </div>

              {/* Scroll Indicator */}
              <div className="flex justify-center mt-16">
                <div className="animate-bounce">
                  <div className="w-6 h-10 border-2 border-solana-green/50 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-solana-green rounded-full mt-2 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits Grid */}
        <section className="animate-fade-in-delay-200">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why Stake on Solana?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<TrendingUp size={24} />}
              title="Earn Rewards"
              description="Generate passive income by staking your SOL tokens with annual percentage yields typically ranging from 6-8%."
              highlight
            />
            <FeatureCard
              icon={<Shield size={24} />}
              title="Secure Network"
              description="Help secure the Solana blockchain while maintaining full ownership of your tokens through delegation."
            />
            <FeatureCard
              icon={<Coins size={24} />}
              title="Compound Growth"
              description="Your staking rewards automatically compound, increasing your stake and future earning potential."
            />
            <FeatureCard
              icon={<Users size={24} />}
              title="No Lock-up Period"
              description="Unstake your tokens at any time with a typical warmup period of 1-2 epochs (2-4 days)."
            />
            <FeatureCard
              icon={<Award size={24} />}
              title="Validator Choice"
              description="Select from hundreds of validators based on performance, commission rates, and geographic distribution."
            />
            <FeatureCard
              icon={<BookOpen size={24} />}
              title="Easy to Start"
              description="Begin staking with any amount of SOL using user-friendly interfaces and wallet integrations."
            />
          </div>
        </section>

        {/* How to Stake Steps */}
        <section className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200/20 dark:border-gray-700/20 animate-fade-in-delay-400">
          <h2 className="text-3xl font-bold text-center mb-8">
            How to Start Staking SOL
          </h2>
          <div className="max-w-2xl mx-auto">
            <StepCard
              step={1}
              title="Connect Your Wallet"
              description="Connect a Solana-compatible wallet like Phantom, Solflare, or Ledger to access your SOL tokens."
            />
            <StepCard
              step={2}
              title="Choose a Validator"
              description="Research and select a validator based on their performance, commission rate, and reliability metrics."
            />
            <StepCard
              step={3}
              title="Delegate Your SOL"
              description="Create a stake account and delegate your SOL tokens to your chosen validator to start earning rewards."
            />
            <StepCard
              step={4}
              title="Monitor Performance"
              description="Track your staking rewards, validator performance, and adjust your strategy as needed."
              isLast
            />
          </div>
        </section>

        {/* What is Staking Section */}
        <section className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200/20 dark:border-gray-700/20 animate-fade-in-delay-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-solana-green to-emerald-400 rounded-lg">
              <Info size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold">What is Staking?</h2>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed mb-6">
              Staking is the process of delegating your SOL tokens to one or
              more validators, who process transactions and keep the network
              secure. Validators earn rewards for their services and delegators
              then get a proportional amount of the rewards less the validator's
              commission.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              In order to delegate your SOL tokens, you need to create a
              separate stake account and choose a validator to delegate to. You
              can do it either from command line interface or by using one of
              the supported wallets.
            </p>

            <div className="bg-gradient-to-r from-solana-green/10 to-emerald-400/10 p-6 rounded-xl border border-solana-green/20 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={20} className="text-solana-green" />
                <h3 className="text-xl font-semibold">Staking Timeline</h3>
              </div>
              <p className="leading-relaxed">
                After you delegate your SOL tokens, you need to wait until the
                next epoch for the changes to take effect. Throughout the epoch
                validator is voting and generates new transactions according to
                the leader schedule and only after one entire epoch ends, the
                reward is added to your staking pool and is automatically
                delegated to the same validator.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ Please note that during the pending epoch your tokens
                  cannot be withdrawn.
                </p>
              </div>
              <p className="mt-4">
                If you wish to undelegate your tokens from the validator, you
                need to wait until the end of the epoch. In this case your last
                reward will be added to your stake account and will no longer be
                delegated.
              </p>
            </div>
          </div>
        </section>

        {/* Choosing the Right Validator */}
        <section className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200/20 dark:border-gray-700/20 animate-fade-in-delay-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Target size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold">Choosing the Right Validator</h2>
          </div>

          <p className="text-lg leading-relaxed mb-8">
            There are a couple of things to consider while choosing the right
            validator to delegate your stake to. In order to be able to vote
            properly and create new transactions it needs to have constant high
            speed network access and good overall performance. Another important
            thing is the commission validator takes to cover its costs - the
            less the better. You should also check if validator is credible and
            operates in a transparent manner.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-green-200 dark:border-green-700/30 bg-green-50/50 dark:bg-green-900/10">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={20} className="text-green-600" />
                <h3 className="text-xl font-semibold">Performance</h3>
              </div>
              <p className="text-sm leading-relaxed">
                We're gathering statistical data to determine how well the
                validator operates within Solana network. Root block distance
                and vote distance show how far behind it is from the top of the
                blockchain while the skipped slot % measures the percent of the
                time that a leader fails to produce a block during their
                allocated slots.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-blue-200 dark:border-blue-700/30 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex items-center gap-3 mb-4">
                <Coins size={20} className="text-blue-600" />
                <h3 className="text-xl font-semibold">Commission</h3>
              </div>
              <p className="text-sm leading-relaxed">
                The important thing to notice here is that commissions can be
                changed at any moment, so it's crucial to check for particular
                validators commission change history and see if there's no
                malicious behavior. Some validators offer 0% commission as an
                introductory offer. Contact them to see when the offer expires.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-purple-200 dark:border-purple-700/30 bg-purple-50/50 dark:bg-purple-900/10">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-purple-600" />
                <h3 className="text-xl font-semibold">Reliability</h3>
              </div>
              <p className="text-sm leading-relaxed">
                If the validator has all the information filled up, has its own
                website and no malicious behavior in the past is detected, it is
                more likely that it cares about reliability and thus is more
                trustworthy.
              </p>
            </div>
          </div>
        </section>

        {/* Data Centers Section */}
        <section className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200/20 dark:border-gray-700/20 animate-fade-in-delay-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <MapPin size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold">Data Centers</h2>
          </div>

          <p className="text-lg leading-relaxed mb-6">
            For security reasons it is recommended that the validators in Solana
            cluster are spread among as many locations as possible. It reduces
            the possibility of network collapse in case of a data center
            breakage. On our data centers page you can examine the validators
            distribution between data centers and organizations Autonomous
            System Numbers (ASN).
          </p>
        </section>

        {/* Validator Score Explanation */}
        <section className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200/20 dark:border-gray-700/20 animate-fade-in-delay-750">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <BarChart3 size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold">
              How Does the Validator Score V1 Work?
            </h2>
          </div>

          <p className="text-lg leading-relaxed mb-8">
            We track validator performance over several dimensions and assign a
            score in the range of (0..2) for each. The scores also correlate
            with colored icons: 🟢 is excellent, 🟡 is OK, and 🔴 means there is
            room for improvement.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Performance Metrics */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold mb-4">
                Performance Metrics
              </h3>

              <div className="p-6 rounded-xl border border-green-200 dark:border-green-700/30 bg-green-50/50 dark:bg-green-900/10">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Activity size={20} className="text-green-600" />
                  Root Block Distance
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">🟢</span>
                    (2 points) Validator median block distance is at, or below,
                    the cluster median
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🟡</span>
                    (1 point) Validator average block distance is at, or below,
                    the cluster average
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">🔴</span>
                    (0 points) Validator average is higher than the cluster
                    average
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-blue-200 dark:border-blue-700/30 bg-blue-50/50 dark:bg-blue-900/10">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Zap size={20} className="text-blue-600" />
                  Vote Distance
                </h4>
                <p className="text-sm">
                  The scoring rules are the same as Root Block Distance above.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-purple-200 dark:border-purple-700/30 bg-purple-50/50 dark:bg-purple-900/10">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Target size={20} className="text-purple-600" />
                  Skipped Slot %
                </h4>
                <p className="text-sm mb-3">
                  We track a trailing 24-hour moving average of the skip rate
                  compared to cluster median and average.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">🟢</span>
                    (2 points) Skipped slot % is at, or below, the cluster
                    median
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🟡</span>
                    (1 point) Skipped slot % is at, or below, the cluster
                    average
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">🔴</span>
                    (0 points) Average is higher than the cluster average
                  </li>
                </ul>
              </div>
            </div>

            {/* Other Scoring Factors */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold mb-4">
                Additional Factors
              </h3>

              <div className="p-6 rounded-xl border border-orange-200 dark:border-orange-700/30 bg-orange-50/50 dark:bg-orange-900/10">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Clock size={20} className="text-orange-600" />
                  Vote Latency
                </h4>
                <p className="text-sm mb-3">
                  Average number of slots it takes for validator to vote for a
                  block.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">🟢</span>
                    (2 points) Average below 2 slots
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🟡</span>
                    (1 point) Average between 2 and 3 slots
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">🔴</span>
                    (0 points) Average above 3 slots
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-cyan-200 dark:border-cyan-700/30 bg-cyan-50/50 dark:bg-cyan-900/10">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Info size={20} className="text-cyan-600" />
                  Published Information
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">🟢</span>
                    (2 points) Published all four data elements (Name, Avatar,
                    Website URL, Details)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🟡</span>
                    (1 point) Published two or three parts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">🔴</span>
                    (0 points) Published only one, or zero, pieces of contact
                    data
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-red-200 dark:border-red-700/30 bg-red-50/50 dark:bg-red-900/10">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  Contra-Scores (Penalties)
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <strong>Stake Concentration:</strong> -2 points if in top
                    33% of stake holders
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <strong>Data Center Concentration:</strong> -2 points if in
                    high-concentration data center
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <strong>Authorized Withdrawer:</strong> -2 points if
                    identity matches withdrawer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <strong>Consensus Mods:</strong> -2 points for unproven
                    software modifications
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-solana-green/10 to-emerald-400/10 rounded-xl border border-solana-green/20">
            <p className="text-lg font-semibold text-center">
              The maximum score is currently thirteen (13) points:
              🟢🟢🟢🟢🟢🟢⭐
            </p>
          </div>
        </section>

        {/* Dictionary Section */}
        <section className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200/20 dark:border-gray-700/20 animate-fade-in-delay-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold">Dictionary</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">Commission</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Commission is a percentage value set by a validator to
                  determine how much of the rewards earned does it collect in
                  order to incur the costs. It's automatically deducted from
                  your rewards pay outs. It can be set anywhere between 0% and
                  100% and can be changed at any moment.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">Epoch</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Time determined by number of slots, for which the leader
                  schedule is valid.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">Root Distance</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Measures the median & average distance in block height between
                  the validator and the tower's highest block. Smaller numbers
                  mean that the validator is near the top of the tower.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">Vote Distance</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Is very similar to the Root Block Distance score above. Lower
                  numbers mean that the node is voting near the front of the
                  group.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">Skipped Slot %</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Measures the percent of the time that a leader fails to
                  produce a block during their allocated slots. A lower number
                  means that the leader is making blocks at a very high rate.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">Delinquency</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  If the validator is not active in the Solana network it is
                  considered to be delinquent. Short-time delinquencies are
                  considered acceptable, since it occurs while software updates
                  or temporary internet outages.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">
                  Stake Concentration
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Solana is a decentralized proof-of-stake blockchain. It is
                  best for the network and for those who use it, that the total
                  stake is divided among as many validators as possible. Keep
                  this in mind while choosing a validator to delegate to.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">Gross ROD</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Gross Return on Delegation is a percentage value that
                  represents total return from Solana network to both validators
                  and stakers. It is calculated as: (stake_accounts_rewards +
                  vote_accounts_rewards / total_active_stake) *
                  number_of_epochs_per_year.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-lg mb-2">Stake Pool</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Stake pools are an alternative method of earning staking
                  rewards. This program allows SOL holders to stake and earn
                  rewards without managing stakes. Read more about the program
                  on Solana website.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="space-y-8 animate-fade-in-delay-800">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>

          <CustomAccordion
            items={[
              {
                question: "How to become a validator?",
                answer:
                  "Please take a look at this detailed guide on Solana website: https://docs.solana.com/running-validator.",
              },
              {
                question: "How is my Personal Data protected?",
                answer:
                  "All Consumer Personal Information is encrypted in transit via HTTPS. You can see our secure certificate by clicking the lock icon in your browser location bar. We also encrypt all Personal Information at rest when it is stored within our database.",
              },
              {
                question: "Why is my validator marked 'private'?",
                answer:
                  "It's based on commission rate. 100% commission means that you are not looking for delegations, so we mark you as 'private'. Private validators are always assigned with total score 0, despite their performance.",
              },
              {
                question:
                  "Why do I see withdrawer warning next to my validator?",
                answer:
                  "It informs visitors that your validator identity matches the withdraw authority on your vote account. It is a serious security risk, eg. if someone hacks into your validator, they can steal from the vote account. Keep the withdraw authority key offline or in a multisig to minimize the risk. Once you fix it, the warning will be taken off automatically within few hours.",
              },
              {
                question: "Why do I see admin warning next to my validator?",
                answer:
                  "It informs visitors that validator's actions are malicious or harmful to the cluster. Hover your mouse over the warning symbol next to validator's name to see the details. Validators with red warnings are always assigned with total score 0, despite their performance.",
              },
              {
                question: "Why can't I see my validator on main page?",
                answer:
                  "There are several possible causes. First, please double check and confirm that you're searching in the correct network. Then, please make sure your validator is active and voting. Make sure your validator is visible in the output of the following CLI command: 'solana validators -u t | grep validator-pubkey'. Also confirm that there are some SOL delegated to your validator. We suppress all nodes with zero stake.",
              },
              {
                question: "How do I start staking?",
                answer:
                  "First, you'll need some SOLs. You can buy them on Coinbase. Then send them to your web wallet, such as Phantom or Solflare. For other options check out Solana web wallets or Solana mobile wallets. You are ready to stake! To learn more about staking see Solana staking docs. Then check out our advice on how to choose the right validator.",
              },
              {
                question: "How to find the best validator?",
                answer:
                  "To find a good validator, please start at the top of the 'Score' view on the home page and click through to see validator details. Then read Choosing Validator section on this page to find out what you should watch out for.",
              },
              {
                question:
                  "How often can I change the validator? Is there a minimum period?",
                answer:
                  "It usually takes 1 epoch for stake to warm up or cool down. Try to split your stake across several validators. Please also read our advice on how to choose the right validator and check out Solana stake pool program.",
              },
              {
                question: "How often are the staking rewards paid out?",
                answer:
                  "It usually takes 1 epoch for stake to warm up or cool down. After that, you should see rewards in your wallet. For better results, try to split your stake across several validators. Please also read our advice on how to choose the right validator or check out Solana stake pool program.",
              },
              {
                question: "Where can I find the APY?",
                answer:
                  "Non-custodial staking on Solana is NOT an interest-bearing investment -- there is no forward-looking APY. Our home page shows the overall Return on Delegation (ROD). Performance for individual validators will vary slightly with their commission and relative performance.",
              },
              {
                question: "Can I add a validator to my favourites?",
                answer:
                  "You need to create user account or sign in to your user account first. Then you can create your own watchlist by clicking on star ⭐ icon next to each validator on the list.",
              },
            ]}
          />
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 bg-gradient-to-r from-solana-green/10 to-emerald-400/10 rounded-2xl border border-solana-green/20 animate-fade-in-delay-800">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Staking?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Now that you understand the fundamentals, explore our validator list
            and start earning rewards on your SOL tokens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/validators"
              className="px-8 py-3 bg-gradient-to-r from-solana-green to-emerald-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center"
            >
              <Users size={20} />
              Browse Validators
              <ArrowRight size={16} />
            </a>
            <a
              href="/calculator"
              className="px-8 py-3 border border-solana-green text-solana-green hover:bg-solana-green hover:text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 justify-center"
            >
              <Calculator size={20} />
              Use Calculator
            </a>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200/20 dark:border-gray-700/20 animate-fade-in-delay-1000">
          <h2 className="text-2xl font-bold text-center mb-6">
            Additional Resources
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="https://docs.solana.com/staking"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-solana-green transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen size={20} className="text-solana-green" />
                <span className="font-semibold">Official Docs</span>
                <ExternalLink
                  size={16}
                  className="text-gray-400 group-hover:text-solana-green transition-colors"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Comprehensive staking documentation from Solana Labs
              </p>
            </a>
            <a
              href="https://solanabeach.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-solana-green transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-solana-green" />
                <span className="font-semibold">Solana Beach</span>
                <ExternalLink
                  size={16}
                  className="text-gray-400 group-hover:text-solana-green transition-colors"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Advanced network analytics and validator performance data
              </p>
            </a>
            <a
              href="https://stakewiz.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-solana-green transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Award size={20} className="text-solana-green" />
                <span className="font-semibold">Stake Wiz</span>
                <ExternalLink
                  size={16}
                  className="text-gray-400 group-hover:text-solana-green transition-colors"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Validator scoring and recommendation platform
              </p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
