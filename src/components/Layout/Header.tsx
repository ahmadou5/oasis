"use client";
import React, { useEffect, useState } from "react";
import { ShoppingCart, Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import EpochCard from "../EpochCard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EpochConverter } from "@/lib/epochConverter";
import { useValidators } from "@/hooks/useValidators";
import { WalletBalanceDisplay } from "../WalletBalanceDisplay";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface NavigationItem {
  name: string;
  href: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { epochDetails } = useValidators();
  const pathname = usePathname();

  const navigation: NavigationItem[] = [
    { name: "Home", href: "/" },
    { name: "Validators", href: "/validators" },
    { name: "Calculator", href: "/calculator" },
  ];

  const epochInfo = EpochConverter.convertEpochToTime({
    epoch: 887,
    absoluteSlot: 383362707,
    slotIndex: 178707,
    slotsInEpoch: 432000,
  });

  const isActive = (path: string): boolean => pathname === path;
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-200",
        scrolled
          ? "lg:bg-black/0 bg-black/0 lg:backdrop-blur-md backdrop-blur-md"
          : "lg:bg-transparent backdrop-blur-md bg-black/0"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={"/"} className="flex items-center space-x-3">
            <div className="w-9 h-9 dark:bg-black/70 light:bg-white/60 rounded-lg flex items-center border dark:border-white/70 light:border-black justify-center shadow-sm">
              <span className="dark:text-white/70 light:text-black/50 font-bold text-lg">
                pb
              </span>
            </div>
            <span className="text-xl font-semibold text-primary">
              Puffy Bites
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-primary dark:text-primary-light"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <WalletBalanceDisplay
                size="sm"
                showLabel={true}
                showRefresh={true}
                variant="inline"
                className="min-w-[160px]"
              />
            </div>

            <WalletMultiButton className="!bg-gradient-to-r !from-solana-purple !to-solana-blue hover:!from-solana-purple/90 hover:!to-solana-blue/90 !rounded-lg !font-semibold !transition-all !duration-200 !shadow-lg hover:!shadow-xl" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="flex items-center  w-full h-auto left-0 right-0  backdrop-blur-xl z-50 md:hidden">
            {/* Mobile Menu */}
            <div className="w-full">
              <nav className="flex flex-col py-4 px-2">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`font-medium transition-all w-full duration-200 py-3 px-4 rounded-lg animate-fade-in-up ${
                      isActive(item.href)
                        ? "text-primary dark:text-primary-light bg-blue-50/80 dark:bg-blue-950/80"
                        : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-50/80 dark:hover:bg-gray-900/80"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
