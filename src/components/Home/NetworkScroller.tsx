"use client";

import React, { useState } from "react";
import { ValidatorInfo, XandeumNodeWithMetrics } from "@/types";

import { ValidatorTrendCard } from "./ValidatorTrend";
import LogoScroller from "./Scroller";
import PNodeScroller from "../Xandeum/PnodeScroller";

interface NetworkScrollersProps {
  validators: ValidatorInfo[];
  pnodes: XandeumNodeWithMetrics[];
  onValidatorSelect?: (validator: ValidatorInfo) => void;
  onPNodeSelect?: (pnode: XandeumNodeWithMetrics) => void;
}

// Example 1: Separate Sections (Both Always Visible)
export function NetworkScrollersSeparate({
  validators,
  pnodes,
  onValidatorSelect,
  onPNodeSelect,
}: NetworkScrollersProps) {
  // Filter active validators
  const activeValidators = validators.filter((v) => v.status === "active");

  // Convert validators to logo format for LogoScroller
  const validatorLogos = activeValidators.map((validator) => ({
    id: validator.address,
    component: (
      <ValidatorTrendCard
        validator={validator}
        onSelect={() => onValidatorSelect?.(validator)}
      />
    ),
  }));

  return (
    <div className="w-full space-y-8 py-6">
      {/* Validators Scroller */}
      <LogoScroller logos={validatorLogos} />

      {/* PNodes Scroller */}
      <PNodeScroller pnodes={pnodes} onPNodeSelect={onPNodeSelect} />
    </div>
  );
}

// Example 3: Conditional Display Based on App Mode
export function NetworkScrollersConditional({
  validators,
  pnodes,
  onValidatorSelect,
  onPNodeSelect,
  appMode,
}: NetworkScrollersProps & { appMode: "normal" | "xendium" }) {
  const activeValidators = validators.filter((v) => v.status === "active");

  const validatorLogos = activeValidators.map((validator) => ({
    id: validator.address,
    component: (
      <ValidatorTrendCard
        validator={validator}
        onSelect={() => onValidatorSelect?.(validator)}
      />
    ),
  }));

  return (
    <div className="w-full py-6">
      {appMode === "normal" ? (
        // Show validators in normal mode
        <LogoScroller logos={validatorLogos} />
      ) : (
        // Show PNodes in xendium mode
        <PNodeScroller pnodes={pnodes} onPNodeSelect={onPNodeSelect} />
      )}
    </div>
  );
}

// Example 4: Stacked with Section Headers
export function NetworkScrollersStacked({
  validators,
  pnodes,
  onValidatorSelect,
  onPNodeSelect,
}: NetworkScrollersProps) {
  const activeValidators = validators.filter((v) => v.status === "active");

  const validatorLogos = activeValidators.map((validator) => ({
    id: validator.address,
    component: (
      <ValidatorTrendCard
        validator={validator}
        onSelect={() => onValidatorSelect?.(validator)}
      />
    ),
  }));

  const onlinePNodesCount = pnodes.filter((p) => p.isOnline).length;
  const totalPNodes = pnodes.length;

  return (
    <div className="w-full space-y-10 py-6">
      {/* Validators Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Active Validators
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Top performing validators on the network
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {activeValidators.length}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
          </div>
        </div>
        <LogoScroller logos={validatorLogos} />
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-gray-200 dark:border-slate-800"></div>
      </div>

      {/* PNodes Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                PNodes Network
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Distributed storage nodes across the globe
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {onlinePNodesCount}
              </div>
              <div className="text-xs text-gray-500">
                Online / {totalPNodes} Total
              </div>
            </div>
          </div>
        </div>
        <PNodeScroller pnodes={pnodes} onPNodeSelect={onPNodeSelect} />
      </section>
    </div>
  );
}

// Default export - use the stacked version as default
export default NetworkScrollersStacked;
