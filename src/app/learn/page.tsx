"use client";

import React from "react";
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
      {!isLast && <div className="w-0.5 h-16 bg-gradient-to-b from-solana-green to-emerald-400 mt-2" />}
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
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        
        {/* Hero Section - Premium Design */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden animate-fade-in">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-solana-green/20 via-emerald-400/10 to-green-500/20" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,241,149,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,241,149,0.03)_1px,transparent_1px)] bg-[size:64px_64px] animate-pulse" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-solana-green/20 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }} />
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }} />
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
                <div className="absolute inset-0 rounded-full border-2 border-solana-green/30 animate-spin-slow" style={{ width: '120px', height: '120px', top: '-10px', left: '-10px' }} />
                <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-spin-reverse" style={{ width: '140px', height: '140px', top: '-20px', left: '-20px' }} />
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
                Unlock the potential of your SOL tokens with our comprehensive staking guide. 
                <span className="font-semibold text-solana-green"> Learn, stake, and earn </span> 
                with confidence.
              </p>

              {/* Stats Row */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-12 pt-8 border-t border-gray-200/20 dark:border-gray-700/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-solana-green">500+</div>
                  <div className="text-sm text-gray-500">Active Validators</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-500">6-8%</div>
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
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
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

        {/* FAQ Section */}
        <section id="faq" className="space-y-8 animate-fade-in-delay-600">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>

          <CustomAccordion items={[
            {
              question: "What is Solana staking?",
              answer: "Staking on Solana is the process of delegating your SOL tokens to validators who help secure the network by validating transactions and producing new blocks. In return, you earn staking rewards (typically 6-8% APY) while helping to secure the network. You maintain full ownership of your tokens and can unstake at any time."
            },
            {
              question: "How do I choose a good validator?",
              answer: "Look for validators with high uptime (>95%), reasonable commission rates (5-10%), good performance history, and strong community reputation. Avoid validators with high skip rates or frequent delinquencies. Consider geographic diversity and check if they have a website or social media presence for transparency."
            },
            {
              question: "What are the risks of staking?",
              answer: "Staking SOL is generally low-risk. The main risks include: validator downtime (reduces rewards), slashing (very rare on Solana), and SOL price volatility. There's no risk of losing your principal SOL tokens through normal staking operations. You can unstake anytime with a 2-4 day cooldown period."
            },
            {
              question: "How much can I earn from staking?",
              answer: "Staking rewards on Solana typically range from 6-8% APY, depending on the validator's commission rate and network conditions. For example, if you stake 100 SOL with a 7% APY validator charging 5% commission, your effective APY would be about 6.65%, earning you roughly 6.65 SOL per year."
            },
            {
              question: "What are epochs and when do I get rewards?",
              answer: "Solana operates on epochs, which last approximately 2-3 days. When you first stake, it takes 1 epoch to activate, and you'll receive your first rewards after the 2nd epoch. After that, rewards are distributed automatically every epoch. You don't need to do anything once staked."
            },
            {
              question: "Is there a minimum amount to stake?",
              answer: "There's no minimum amount required to stake SOL. However, you'll need to account for transaction fees (usually a few cents) and the rent-exempt minimum for creating a stake account (about 0.00228 SOL). You can start staking with any amount of SOL you're comfortable with."
            },
            {
              question: "Can I unstake my SOL anytime?",
              answer: "Yes, you can unstake (undelegate) your SOL at any time. However, there's a cooldown period of 1 epoch (2-3 days) before your SOL becomes available in your wallet. During this cooldown, your SOL won't earn rewards. Plan accordingly if you need access to your funds quickly."
            },
            {
              question: "What's the difference between staking and liquid staking?",
              answer: "Traditional staking requires you to lock up your SOL for epochs, while liquid staking protocols give you tradeable tokens representing your staked SOL. Liquid staking offers more flexibility but may involve additional smart contract risks and fees. Choose based on your needs for liquidity and risk tolerance."
            }
          ]} />
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 bg-gradient-to-r from-solana-green/10 to-emerald-400/10 rounded-2xl border border-solana-green/20 animate-fade-in-delay-800">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Staking?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Now that you understand the fundamentals, explore our validator list and start earning rewards on your SOL tokens.
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
          <h2 className="text-2xl font-bold text-center mb-6">Additional Resources</h2>
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
                <ExternalLink size={16} className="text-gray-400 group-hover:text-solana-green transition-colors" />
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
                <ExternalLink size={16} className="text-gray-400 group-hover:text-solana-green transition-colors" />
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
                <ExternalLink size={16} className="text-gray-400 group-hover:text-solana-green transition-colors" />
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