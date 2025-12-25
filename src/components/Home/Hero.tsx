"use client";
import { ValidatorTrendCard } from "./ValidatorTrend";
import LogoScroller from "./Scroller";

import { useValidators } from "../../hooks/useValidators";
import { useTheme } from "../../context/ThemeContext";
import { EpochConverter } from "../../lib/epochConverter";
import { PNodeMap } from "../Xandeum/PNodeMap";
import AppModeToggle from "../AppModeToggle";
import { usePnodes } from "../../hooks/usePnodes";
import { ValidatorMapExample } from "../ValidatorMapExample";
import { DashboardStatsAlternative } from "./DashboardLayout";
import { useAppModeSwitch } from "../../hooks/useAppModeStore";
import { NetworkScrollersConditional } from "./NetworkScroller";
import { NetworkStatsDashboard } from "../Xandeum/cards/DashMint";

export function Hero() {
  const { pnodes } = usePnodes();
  const { isNormalMode, isXandeumMode } = useAppModeSwitch();
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
      <AppModeToggle />
      <NetworkScrollersConditional
        validators={validators}
        pnodes={pnodes}
        appMode={isNormalMode ? "normal" : "xendium"}
      />
      {isNormalMode ? (
        <DashboardStatsAlternative />
      ) : (
        <NetworkStatsDashboard
          pnodes={pnodes}
          refreshInterval={3000}
          //onRefresh={() => alert("Refreshing")}
        />
      )}

      <div className="w-[100%] h-auto py-8 ml-auto mr-auto flex items-center justify-between">
        <div className="w-[100%] px-3 py-2">
          {isNormalMode ? (
            <ValidatorMapExample />
          ) : (
            <PNodeMap pnodes={pnodes} />
          )}
        </div>
      </div>
    </div>
  );
}
