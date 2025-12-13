"use client";
import { useTheme } from "@/context/ThemeContext";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Bell,
  ChevronDown,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import React from "react";
import { WalletBalanceDisplay } from "../WalletBalanceDisplay";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";

import { clearSearchString, setSearchString } from "@/store/slices/searchSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

interface NewHeaderProps {
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const NewHearder: React.FC<NewHeaderProps> = ({ setMobileMenuOpen }) => {
  //const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { connected } = useWallet();
  const searchString = useSelector<RootState>((state) => state.search.value);
  const dispatch = useDispatch<AppDispatch>();
  const { theme, toggleTheme } = useTheme();

  //console.log(searchString);
  return (
    <>
      {/* Header - Fixed */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 bg-white/5 dark:bg-black">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-lg transition text-gray-700 dark:text-gray-300"
              >
                {<Menu className="w-5 h-5" />}
              </button>

              {/* Grid Icon */}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Notification Bell 
              <button className="relative p-2.5 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-lg transition group">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
              </button>

              {/* Messages 
              <button className="hidden sm:block p-2.5 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-lg transition group">
                <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter validator name, symbol or address"
                  className="bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 w-48 lg:w-[460px] transition"
                  onChange={(e) => dispatch(setSearchString(e.target.value))}
                />
              </div>

              <WalletMultiButton
                style={{
                  backgroundColor: "#16a34a",
                  borderRadius: "12px",
                  height: "40px",
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-4 md:px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-green-500/20 text-sm"
              />

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  console.log("Theme toggle clicked!", theme);
                  toggleTheme();
                }}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
