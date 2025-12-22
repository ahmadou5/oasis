import { XandeumNodeWithMetrics } from "../../../types";
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

interface HealthDistributionProps {
  pnodes: XandeumNodeWithMetrics[];
  metrics: NetworkMetrics;
}
export const HealthDistribution = ({
  pnodes,
  metrics,
}: HealthDistributionProps) => {
  return (
    <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/50 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Health Score Distribution
      </h3>

      <div className="space-y-3">
        <HealthDistributionBar
          label="Excellent (80-100)"
          count={pnodes.filter((n) => n.healthScore >= 80).length}
          total={metrics.totalNodes}
          color="bg-green-500"
        />
        <HealthDistributionBar
          label="Good (60-79)"
          count={
            pnodes.filter((n) => n.healthScore >= 60 && n.healthScore < 80)
              .length
          }
          total={metrics.totalNodes}
          color="bg-yellow-500"
        />
        <HealthDistributionBar
          label="Fair (40-59)"
          count={
            pnodes.filter((n) => n.healthScore >= 40 && n.healthScore < 60)
              .length
          }
          total={metrics.totalNodes}
          color="bg-orange-500"
        />
        <HealthDistributionBar
          label="Poor (<40)"
          count={pnodes.filter((n) => n.healthScore < 40).length}
          total={metrics.totalNodes}
          color="bg-red-500"
        />
      </div>
    </div>
  );
};

// Helper component for health distribution bars
function HealthDistributionBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 ${color} rounded-full`}></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {label}
          </span>
        </div>
        <span className="font-medium text-gray-900 dark:text-white">
          {count}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
