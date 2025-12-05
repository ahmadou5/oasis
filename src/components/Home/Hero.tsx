"use client";
import { useTheme } from "@/context/ThemeContext";
import { useValidators } from "@/hooks/useValidators";
import { EpochConverter } from "@/lib/epochConverter";
import { ValidatorTrendCard } from "./ValidatorTrend";

export function Hero() {
  const {
    validators,
    epochDetails,
    loading,
    error,
    lastUpdated,
    refreshValidators,
    clearCache,
    isFromCache,
    cacheInfo,
  } = useValidators();
  const { theme } = useTheme();
  console.log("Epoch Details in Hero:", epochDetails);
  const epochInfo = EpochConverter.convertEpochToTime({
    epoch: epochDetails?.epoch || 0,
    absoluteSlot: epochDetails?.absoluteSlot || 0,
    slotIndex: epochDetails?.slotIndex || 0,
    slotsInEpoch: epochDetails?.slotsInEpoch || 1,
  });

  return (
    <div className="flex flex-col space-y-12 bg-transparent">
      <div>
        <p className="text-3xl text-gray-900 dark:text-gray-100 font-medium">
          Home
        </p>
      </div>
      <div className="w-[90%] py-3 px-4 flex ml-auto mr-auto bg-white/5 dark:bg-gray-800/50 rounded-2xl mt-2 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20">
        <ValidatorTrendCard
          validator={validators[2]}
          onSelect={() => alert(`selected is ${validators[1].name}`)}
        />
      </div>
    </div>
  );
}
