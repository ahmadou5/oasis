import { StakingCalculator } from '@/components/StakingCalculator'

export default function CalculatorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Staking Rewards Calculator
        </h1>
        <p className="text-solana-gray-400 text-lg max-w-2xl mx-auto">
          Calculate your potential staking rewards with different validators and stake amounts.
        </p>
      </div>
      
      <StakingCalculator />
    </div>
  )
}