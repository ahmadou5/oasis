import { Activity, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { formatPercent } from "../../../utils/formatters";
interface NetworkMetrics {
  totalNodes: number;
  onlineNodes: number;
  publicNodes: number;
  avgHealthScore: number;
  networkUptime: number;
  totalStorageCapacity: number;
  usedStorage: number;
  storageEfficiency: number;
  trends: {
    onlineChange: number;
    healthChange: number;
    storageChange: number;
  };
}

interface HealthScoreProps {
  metrics: NetworkMetrics;
}
export const HealthScoreCard = ({ metrics }: HealthScoreProps) => {
  return (
    <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Health Score
          </h3>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {formatPercent(metrics.avgHealthScore)}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-green-500/10 rounded-xl py-1 px-3">
          <div
            className={`inline-flex items-center gap-1 ${
              metrics.trends.healthChange >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <span className="text-sm font-semibold">
              {metrics.trends.healthChange >= 0 ? "+" : ""}
              {Math.abs(metrics.trends.healthChange).toFixed(1)} points
            </span>
          </div>
        </div>
      </div>
      <div className="pt-3 border-t border-gray-200 dark:border-slate-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Network health rating
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <Activity className="w-5 h-5 text-green-500" />
      </div>
    </div>
  );
};

{
  /* Health Score Card */
}
