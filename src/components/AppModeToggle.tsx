"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Server,
  Layers,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAppModeSwitch } from "../hooks/useAppModeStore";

const AppModeToggle: React.FC = () => {
  const {
    currentMode,
    switchMode,
    isLoading,
    error,
    isNormalMode,
    isXendiumMode,
  } = useAppModeSwitch();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleModeSelect = (mode: "normal" | "xendium") => {
    switchMode(mode);
    setIsOpen(false);
  };

  const modes = [
    {
      id: "normal" as const,
      name: "Solana Validators",
      description: "Standard Solana validators",
      icon: Layers,
      color: "green",
      isActive: isNormalMode,
    },
    {
      id: "xendium" as const,
      name: "Xendium PNodes",
      description: "Xendium protocol nodes",
      icon: Server,
      color: "green",
      isActive: isXendiumMode,
    },
  ];

  const activeMode = modes.find((mode) => mode.isActive);

  return (
    <div className="w-full max-w-sm">
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-full text-left py-2 px-4 border border-green-500/40 rounded-3xl bg-green-500/10 hover:border-green-500/60 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {activeMode && (
              <>
                <div
                  className={`p-2 rounded-lg ${
                    activeMode.color === "green"
                      ? "bg-green-500/5"
                      : "bg-purple-500/20"
                  }`}
                >
                  <activeMode.icon
                    size={18}
                    className={
                      activeMode.color === "green"
                        ? "text-green-500"
                        : "text-purple-400"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {activeMode.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {activeMode.description}
                  </div>
                </div>
              </>
            )}
          </div>

          {isLoading ? (
            <Loader2
              size={20}
              className="text-gray-400 animate-spin flex-shrink-0 ml-2"
            />
          ) : (
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full mt-2 w-full bg-gray-800 border border-green-500/40 rounded-xl overflow-hidden shadow-xl z-50">
            <div className="p-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleModeSelect(mode.id)}
                  disabled={isLoading}
                  className={`w-full text-left p-3 rounded-lg transition-colors mb-1 last:mb-0 ${
                    mode.isActive
                      ? "bg-green-500/20 border border-green-500/40"
                      : "hover:bg-green-500/10 border border-transparent"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        mode.color === "green"
                          ? "bg-green-500/5"
                          : "bg-purple-500/20"
                      }`}
                    >
                      <mode.icon
                        size={18}
                        className={
                          mode.color === "green"
                            ? "text-green-400"
                            : "text-purple-400"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm mb-1 ${
                          mode.isActive ? "text-green-400" : "text-white"
                        }`}
                      >
                        {mode.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {mode.description}
                      </div>
                    </div>
                    {mode.isActive && (
                      <CheckCircle2
                        size={20}
                        className="text-green-400 flex-shrink-0"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Info Footer */}
            <div className="p-3 bg-gray-900/50 border-t border-green-500/20">
              <div className="text-xs text-gray-400">
                {activeMode && (
                  <div>
                    <span className="font-medium text-white">
                      Currently viewing:
                    </span>{" "}
                    {activeMode.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-500/10 border border-red-500/40 rounded-lg">
            <p className="text-sm text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/40 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="text-blue-400 animate-spin" />
              <p className="text-sm text-blue-400">Switching mode...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppModeToggle;
