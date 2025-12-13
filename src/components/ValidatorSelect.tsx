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

interface ValidatorDropdownProps {
  value: string;
  onChange: (address: string) => void;
  validators: ValidatorOption[];
  className?: string;
  label?: string;
  placeholder?: string;
}

export const ValidatorDropdown = ({
  value,
  onChange,
  validators,
  className = "",
  label = "Select Validator",
  placeholder = "Choose a validator...",
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

  const selectedValidator = validators.find((v) => v.address === value);

  // Filter validators based on search query
  const filteredValidators = validators.filter(
    (validator) =>
      validator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      validator.address.toLowerCase().includes(searchQuery.toLowerCase())
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
                <div className="text-xs text-gray-400 mt-0.5">
                  {formatPercent(selectedValidator.apy)} APY • Commission:{" "}
                  {formatPercent(selectedValidator.commission)}
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
                    key={validator.address}
                    type="button"
                    onClick={() => handleSelect(validator.address)}
                    className={`w-full text-left p-3 hover:bg-green-500/10 transition-colors border-b border-gray-700/50 last:border-b-0 ${
                      validator.address === value ? "bg-green-500/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-medium text-sm truncate ${
                              validator.address === value
                                ? "text-green-400"
                                : "text-white"
                            }`}
                          >
                            {validator.name}
                          </span>
                          {validator.status === "active" && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <TrendingUp
                                size={12}
                                className="text-green-500"
                              />
                              {formatPercent(validator.apy)} APY
                            </span>
                            <span>
                              Commission: {formatPercent(validator.commission)}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            Total Stake: {formatSOL(validator.stake)}
                          </div>
                        </div>
                      </div>
                      {validator.address === value && (
                        <Award
                          size={16}
                          className="text-green-400 flex-shrink-0"
                        />
                      )}
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
                    <div>
                      Commission: {formatPercent(selectedValidator.commission)}
                    </div>
                    <div>Total Stake: {formatSOL(selectedValidator.stake)}</div>
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
