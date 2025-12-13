import { StakingDashboard } from "@/components/StakingDashboard";

export default function StakingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">Portfolio</h1>
        <p className="text-solana-gray-400 text-lg max-w-2xl mx-auto">
          Manage your active stakes, track rewards, and manage your staking
          portfolio.
        </p>
      </div>

      <StakingDashboard />
    </div>
  );
}
