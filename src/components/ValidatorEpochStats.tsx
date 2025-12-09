import React from 'react';
import ValidatorEpochChart from './ValidatorEpochChart';

// Sample data generator for testing
const generateSamplePerformanceData = () => {
  const data = [];
  const currentEpoch = 500; // Example current epoch
  
  for (let i = 7; i >= 0; i--) {
    const epoch = currentEpoch - i;
    const baseCredits = 420000;
    const credits = Math.floor(baseCredits * (0.88 + Math.random() * 0.12)); // 88-100% performance
    const baseStake = 50000000000000; // 50M SOL in lamports
    const activeStake = Math.floor(baseStake * (0.95 + Math.random() * 0.1));
    
    data.push({
      epoch,
      activeStake,
      activeStakeAccounts: Math.floor(150 + Math.random() * 50), // 150-200 accounts
      skipRate: Math.random() * 2, // 0-2% skip rate
      credits,
      apy: 6.5 + Math.random() * 1.5 // 6.5-8% APY
    });
  }
  
  return data;
};

interface ValidatorEpochStatsProps {
  validatorAddress?: string;
  validatorName?: string;
  performanceHistory?: Array<{
    epoch: number;
    activeStake: number;
    activeStakeAccounts: number;
    skipRate: number;
    credits: number;
    apy: number;
  }>;
}

const ValidatorEpochStats: React.FC<ValidatorEpochStatsProps> = ({
  validatorAddress,
  validatorName = "Validator",
  performanceHistory
}) => {
  // Use sample data if no real data is provided
  const epochData = performanceHistory || generateSamplePerformanceData();

  return (
    <div className="w-full max-w-lg">
      <ValidatorEpochChart 
        performanceHistory={epochData}
        validatorName={validatorName}
      />
    </div>
  );
};

export default ValidatorEpochStats;