import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Award, TrendingUp } from "lucide-react";

interface ValidatorOption {
  address: string;
  name: string;
  apy: number;
  commission: number;
  stake: number;
  status?: string;
}

interface TimeFrame {
  id: number;
  name: string;
  value: string;
}

interface ValidatorDropdownProps {
  value: string;
  onChange: (address: string) => void;
  validators: TimeFrame[];
  className?: string;
  label?: string;
  placeholder?: string;
}

export const TimeDropdown = ({
  value,
  onChange,
  validators,
  className = "",
  label = "Select TimeFrame",
  placeholder = "Choose a time frame...",
}: ValidatorDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (address: string) => {
    onChange(address);
    setIsOpen(false);
    setSearchQuery("");
  };

  const selectedValidator = validators.find((v) => v.name === value);

  // Filter validators based on search query
  const filteredValidators = validators.filter((validator) =>
    validator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatSOL = (amount: number) => `${amount.toLocaleString()} SOL`;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left py-3 px-4 border border-green-500/40 rounded-xl bg-gray-800/50 hover:border-green-500/60 transition-colors flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            {selectedValidator ? (
              <div>
                <div className="font-medium text-white truncate">
                  {selectedValidator.name}
                </div>
              </div>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
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
          <div className="absolute top-full mt-2 w-full bg-gray-800 border border-green-500/40 rounded-xl overflow-hidden shadow-xl z-50 max-h-[400px] flex flex-col">
            {/* Search Input */}
            <div className="p-3 border-b border-green-500/20">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search validators..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-900/50 border border-green-500/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/60"
                />
              </div>
            </div>

            {/* Validators List */}
            <div className="overflow-y-auto flex-1">
              {filteredValidators.length > 0 ? (
                filteredValidators.map((validator) => (
                  <button
                    key={validator.id}
                    type="button"
                    onClick={() => handleSelect(validator.value)}
                    className={`w-full text-left p-3 hover:bg-green-500/10 transition-colors border-b border-gray-700/50 last:border-b-0 ${
                      validator.value === value ? "bg-green-500/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-medium text-sm truncate ${
                              validator.value === value
                                ? "text-green-400"
                                : "text-white"
                            }`}
                          >
                            {validator.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No validators found
                </div>
              )}
            </div>

            {/* Footer Info */}
            {selectedValidator && (
              <div className="p-3 bg-gray-900/50 border-t border-green-500/20">
                <div className="text-xs text-gray-400">
                  <div className="font-medium text-white mb-1">
                    Selected Validator Details
                  </div>
                  <div className="space-y-0.5">
                    <div>{selectedValidator.name}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
