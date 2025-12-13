"use client";
import { ValidatorTrendCard } from "./ValidatorTrend";
import LogoScroller from "./Scroller";

import EpochCard from "../EpochCard";
import TransactionsCard from "../TransactionsCard";
import SolanaPriceCard from "../SolanaPriceCard";
import { useValidators } from "../../hooks/useValidators";
import { useTheme } from "../../context/ThemeContext";
import { EpochConverter } from "../../lib/epochConverter";
import { ValidatorMap } from "../ValidatorWorldMap";

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
    <div className="flex flex-col bg-transparent">
      {validatorLogos.length > 0 ? (
        <LogoScroller logos={duplicatedLogos} />
      ) : (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
          <div className="text-center py-12 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              No Active Validators
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No active Solana validators found at the moment. Please try
              refreshing the page.
            </p>
          </div>
        </div>
      )}
      <div className="w-[100%] h-auto py-8 ml-auto mr-auto flex items-center justify-between">
        <div className="w-[20%] px-3 py-2"></div>
        <div className="w-[80%] px-3 py-2">
          <ValidatorMap />
        </div>
      </div>

      <div className="w-[100%] h-auto py-2 ml-auto mr-auto flex items-center justify-between">
        <div className="w-[50%] px-3 py-2">
          <SolanaPriceCard />
          <EpochCard />
        </div>
        <div className="w-[50%] px-3 py-2">
          <TransactionsCard />
        </div>
      </div>
    </div>
  );
}
