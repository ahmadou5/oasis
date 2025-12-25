"use client";

import React, { useState } from "react";
import { ValidatorWorldMap } from "./ValidatorWorldMap";
import { ValidatorInfo } from "@/types";
import { useValidators } from "@/hooks/useValidators";
import { Skeleton } from "./Skeleton";
import { Map, List, Eye, EyeOff } from "lucide-react";

/**
 * Example component showing how to use the ValidatorWorldMap
 * This demonstrates the integration of validator location data
 */
export const ValidatorMapExample: React.FC = () => {
  const { validators, loading, error } = useValidators();
  const [selectedValidator, setSelectedValidator] =
    useState<ValidatorInfo | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Filter validators that have location data
  const validatorsWithLocation = validators.filter(
    (validator) =>
      validator.location?.coordinates &&
      validator.location.coordinates.length === 2 &&
      typeof validator.location.coordinates[0] === "number" &&
      typeof validator.location.coordinates[1] === "number"
  );

  const handleValidatorSelect = (validator: ValidatorInfo) => {
    setSelectedValidator(validator);
  };

  const clearSelection = () => {
    setSelectedValidator(null);
  };

  if (loading) {
    return (
      <div className="h-96">
        <div className="card h-full">
          <Skeleton width="w-1/3" height="h-5" />
          <div className="mt-4">
            <Skeleton height="h-72" className="w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">Error loading validators: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {/* Labels toggle */}
          {viewMode === "map" && (
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-2 rounded-xl border border-green-500/50 ${
                showLabels
                  ? "bg-green-500/59  text-white"
                  : "bg-gray-800/89 text-gray-400 hover:text-white"
              }`}
              title={showLabels ? "Hide labels" : "Show labels"}
            >
              {showLabels ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {/* Clear selection */}
          {selectedValidator && (
            <button
              onClick={clearSelection}
              className="px-3 py-2 bg-inherit text-white rounded-xl hover:bg-green-700 border border-green-500/50 text-sm"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === "map" ? (
        <div className="relative">
          <ValidatorWorldMap
            validators={validatorsWithLocation}
            selectedValidator={selectedValidator}
            onValidatorSelect={handleValidatorSelect}
            showLabels={showLabels}
          />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">
            Validators with Location Data
          </h3>
          <div className="space-y-2">
            {validatorsWithLocation.map((validator) => (
              <div
                key={validator.address}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedValidator?.address === validator.address
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
                onClick={() => handleValidatorSelect(validator)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{validator.name}</h4>
                    <p className="text-sm text-gray-400">
                      {validator.location?.city}, {validator.location?.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-400">
                      {((validator.apy || 0) * 100).toFixed(2)}% APY
                    </p>
                    <p className="text-xs text-gray-400">
                      {((validator.stake || 0) / 1000000).toFixed(1)}M SOL
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No location data info */}
      {validatorsWithLocation.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400">
            No validators with location data found. Location data is
            automatically enriched from the validator's data center information.
          </p>
        </div>
      )}
    </div>
  );
};
