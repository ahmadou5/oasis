"use client";
import { useTheme } from "@/context/ThemeContext";
import { useValidators } from "@/hooks/useValidators";
import { EpochConverter } from "@/lib/epochConverter";
import { ValidatorTrendCard } from "./ValidatorTrend";
import LogoScroller from "./Scroller";
import { NewValidatorCard } from "./NewValidatorCard";

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

  // Prepare validators data for the scroller
  const activeValidators =
    validators?.filter((v) => v.status === "active") || [];

  // Convert validators to logos format for the scroller
  const validatorLogos = activeValidators.map((validator) => ({
    id: validator.address ? validator.address : Math.random(),
    component: (
      <ValidatorTrendCard
        key={validator.address}
        validator={validator}
        onSelect={() => alert(validator.name)}
      />
    ),
  }));

  // Duplicate the array to ensure smooth infinite scrolling
  const duplicatedLogos = [...validatorLogos, ...validatorLogos];

  return (
    <div className="flex flex-col space-y-2 bg-transparent">
      {validatorLogos.length > 0 ? (
        <LogoScroller logos={duplicatedLogos} />
      ) : (
        <div className="w-[98%] h-auto py-3 px-4 flex ml-auto mr-auto rounded-2xl mt-0 bg-green-600/0 backdrop-blur-sm border border-green-700/0">
          <p
            className={`${
              theme === "dark" ? "text-gray-500" : "text-black/70"
            }  ml-auto mr-auto text-center`}
          >
            No active Solana validators found
          </p>
        </div>
      )}
    </div>
  );
}
