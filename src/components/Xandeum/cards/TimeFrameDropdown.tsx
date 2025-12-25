import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Clock, CheckCircle2 } from "lucide-react";

interface TimeframeOption {
  value: number;
  label: string;
  description?: string;
}

interface TimeframeDropdownProps {
  value: number;
  onChange: (value: number) => void;
  options?: TimeframeOption[];
  className?: string;
  label?: string;
}

export default function TimeframeDropdown({
  value,
  onChange,
  options = [
    {
      value: 1 * 60 * 1000,
      label: "1 minute",
      description: "Very short-term trends",
    },
    {
      value: 5 * 60 * 1000,
      label: "5 minutes",
      description: "Short-term trends",
    },
    {
      value: 15 * 60 * 1000,
      label: "15 minutes",
      description: "Medium-term trends",
    },
    {
      value: 30 * 60 * 1000,
      label: "30 minutes",
      description: "Long-term trends",
    },
  ],
  className = "",
  label = "Timeframe",
}: TimeframeDropdownProps) {
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

  const handleSelect = (optionValue: number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left py-2 px-5 border border-green-500/40 rounded-xl bg-green-500/5 hover:border-green-500/60 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Clock size={18} className="text-green-400/50" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 dark:text-white truncate">
                {selectedOption?.label || "Select timeframe"}
              </div>
              {selectedOption?.description && (
                <div className="text-xs text-gray-400 truncate">
                  {selectedOption.description}
                </div>
              )}
            </div>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full mt-2 w-full bg-green-500/5 backdrop-blur-xl border border-green-500/40 rounded-xl overflow-hidden shadow-xl z-50">
            <div className="p-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left p-3 rounded-lg transition-colors mb-1 last:mb-0 ${
                    option.value === value
                      ? "bg-green-500/20 border border-green-500/40"
                      : "hover:bg-green-500/10 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Clock size={18} className="text-green-400/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm mb-1 ${
                          option.value === value
                            ? "text-green-400"
                            : " dark:text-white text-gray-800"
                        }`}
                      >
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-gray-400">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {option.value === value && (
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
            <div className="p-3 bg-green-500/5 border-t border-green-500/20">
              <div className="text-xs text-gray-400">
                {selectedOption && (
                  <div>
                    <span className="font-medium dark:text-white text-gray-800">
                      Comparing trends over:
                    </span>{" "}
                    {selectedOption.label}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
