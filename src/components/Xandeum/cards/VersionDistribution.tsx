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

interface VersionDistributionProps {
  pnodes: XandeumNodeWithMetrics[];
  metrics: NetworkMetrics;
}
export const VersionDistribution = ({
  pnodes,
  metrics,
}: VersionDistributionProps) => {
  return (
    <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/50 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Version Distribution
      </h3>

      <div className="space-y-3 max-h-48 overflow-y-auto">
        {Object.entries(
          pnodes.reduce((acc, node) => {
            const version =
              node.versionDisplayName || node.version || "Unknown";
            acc[version] = (acc[version] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        )
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([version, count]) => (
            <div key={version} className="flex items-center justify-between">
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {version}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 bg-green-500/50 rounded-full"
                  style={{
                    width: `${(count / metrics.totalNodes) * 80}px`,
                    minWidth: "4px",
                  }}
                />
                <span className="font-medium text-sm text-gray-900 dark:text-white min-w-[2rem] text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
