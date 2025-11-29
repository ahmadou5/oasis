interface EpochTimeInfo {
  epoch: number;
  absoluteSlot: number;
  slotIndex: number;
  slotsInEpoch: number;
  percentComplete: number;
  estimatedTimeRemaining: string;
  estimatedEndTime: Date;
  humanReadable: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function EpochTimer({ epochInfo }: { epochInfo: EpochTimeInfo }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Epoch {epochInfo.epoch}</h3>
        <span className="text-sm text-gray-400">
          {epochInfo.percentComplete}% complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${epochInfo.percentComplete}%` }}
        />
      </div>

      {/* Time remaining */}
      <p className="text-sm text-gray-400">
        {epochInfo.estimatedTimeRemaining}
      </p>

      {/* Estimated end time */}
      <p className="text-xs text-gray-500 mt-1">
        Ends at {epochInfo.estimatedEndTime.toLocaleString()}
      </p>
    </div>
  );
}
