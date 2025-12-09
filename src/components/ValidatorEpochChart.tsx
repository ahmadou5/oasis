import React from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceEntry {
  epoch: number;
  activeStake: number;
  activeStakeAccounts: number;
  skipRate: number;
  credits: number;
  apy: number;
}

interface ValidatorEpochChartProps {
  performanceHistory: PerformanceEntry[];
  validatorName?: string;
  className?: string;
}

const ValidatorEpochChart: React.FC<ValidatorEpochChartProps> = ({
  performanceHistory,
  validatorName = "Validator",
  className = ""
}) => {
  if (!performanceHistory || performanceHistory.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Performance Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Epoch performance data will appear here once available
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data (reverse to show oldest to newest)
  const chartData = [...performanceHistory].reverse();
  
  // Calculate metrics
  const maxCredits = Math.max(...chartData.map(d => d.credits));
  const minCredits = Math.min(...chartData.map(d => d.credits));
  const avgCredits = chartData.reduce((sum, d) => sum + d.credits, 0) / chartData.length;
  const avgApy = chartData.reduce((sum, d) => sum + d.apy, 0) / chartData.length;
  const avgSkipRate = chartData.reduce((sum, d) => sum + d.skipRate, 0) / chartData.length;
  
  const currentEpoch = chartData[chartData.length - 1];
  const previousEpoch = chartData[chartData.length - 2];
  
  // Calculate trends
  const creditsTrend = previousEpoch 
    ? ((currentEpoch.credits - previousEpoch.credits) / previousEpoch.credits) * 100 
    : 0;
  
  const apyTrend = previousEpoch 
    ? currentEpoch.apy - previousEpoch.apy 
    : 0;

  const getTrendIcon = (value: number) => {
    if (value > 0.1) return <TrendingUp className="w-4 h-4" />;
    if (value < -0.1) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0.1) return "text-green-600 dark:text-green-400";
    if (value < -0.1) return "text-red-600 dark:text-red-400";
    return "text-gray-500 dark:text-gray-400";
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Epoch Performance
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Last {chartData.length} epochs
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 dark:text-gray-500">Current Epoch</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            #{currentEpoch.epoch}
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Credits</span>
            <div className={`flex items-center gap-1 ${getTrendColor(creditsTrend)}`}>
              {getTrendIcon(creditsTrend)}
              <span className="text-xs font-medium">
                {creditsTrend > 0 ? '+' : ''}{creditsTrend.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {currentEpoch.credits.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">APY</span>
            <div className={`flex items-center gap-1 ${getTrendColor(apyTrend)}`}>
              {getTrendIcon(apyTrend)}
              <span className="text-xs font-medium">
                {apyTrend > 0 ? '+' : ''}{apyTrend.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
            {currentEpoch.apy.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 col-span-2 sm:col-span-1">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Skip Rate</div>
          <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
            {currentEpoch.skipRate.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative mb-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-32 sm:h-40 flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500 -translate-x-1 pr-2">
          <span className="text-right">{(maxCredits / 1000).toFixed(0)}k</span>
          <span className="text-right">{(maxCredits * 0.75 / 1000).toFixed(0)}k</span>
          <span className="text-right">{(maxCredits * 0.5 / 1000).toFixed(0)}k</span>
          <span className="text-right">{(maxCredits * 0.25 / 1000).toFixed(0)}k</span>
          <span className="text-right">0</span>
        </div>

        {/* Chart area */}
        <div className="h-32 sm:h-40 flex items-end gap-1 sm:gap-2 ml-8 overflow-x-auto">
          {chartData.map((epochData, index) => {
            const height = maxCredits > 0 ? (epochData.credits / maxCredits) * 100 : 0;
            const isLatest = index === chartData.length - 1;
            const isSecondLatest = index === chartData.length - 2;
            
            return (
              <div key={epochData.epoch} className="flex flex-col items-center group relative flex-shrink-0">
                {/* Bar */}
                <div
                  className={`w-6 sm:w-8 rounded-t-lg transition-all duration-300 hover:opacity-90 cursor-pointer relative ${
                    isLatest 
                      ? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-lg' 
                      : isSecondLatest
                      ? 'bg-gradient-to-t from-purple-500/80 to-purple-300/80'
                      : 'bg-gradient-to-t from-purple-400/60 to-purple-200/60'
                  }`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    <div className="space-y-1">
                      <div className="font-semibold border-b border-gray-600 dark:border-gray-300 pb-1">
                        Epoch {epochData.epoch}
                      </div>
                      <div>Credits: {epochData.credits.toLocaleString()}</div>
                      <div>APY: {epochData.apy.toFixed(2)}%</div>
                      <div>Skip Rate: {epochData.skipRate.toFixed(2)}%</div>
                      <div>Stake: {(epochData.activeStake / 1_000_000_000).toFixed(1)}M SOL</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
                  </div>

                  {/* Performance indicator dot */}
                  {isLatest && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                  )}
                </div>

                {/* Epoch label */}
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-center whitespace-nowrap">
                  {epochData.epoch}
                </span>
              </div>
            );
          })}
        </div>

        {/* X-axis line */}
        <div className="h-px bg-gray-200 dark:bg-gray-600 ml-8 mt-1"></div>
      </div>

      {/* Bottom Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {avgCredits.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Avg Credits
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            {avgApy.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Avg APY
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            {avgSkipRate.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Avg Skip Rate
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            {currentEpoch.activeStakeAccounts.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Stake Accounts
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorEpochChart;