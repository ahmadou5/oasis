"use client";
import React from "react";
import { SidebarItem } from "./SidebarItem";
import {
  Calculator,
  Coins,
  Home,
  LucideAppWindow,
  LucideAward,
  LucideWalletCards,
  X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { usePathname } from "next/navigation";

interface SideBarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  hasDropdown?: boolean;
  url: string;
}

export const SideBar: React.FC<SideBarProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);

  const pathname = usePathname();
  const isActive = (path: string): boolean => pathname === path;
  const { theme } = useTheme();

  const NavItems: NavItem[] = [
    {
      icon: <Home className="text-gray-700 dark:text-gray-300" />,
      label: "Home",
      active: true,
      url: "/",
    },
    {
      icon: <LucideAward className="text-gray-700 dark:text-gray-300" />,
      label: "Validator List",
      active: true,
      url: "/validators",
    },
    {
      icon: <Coins className="text-gray-700 dark:text-gray-300" />,
      label: "USDC Staking",
      active: true,
      url: "/validators",
    },
    {
      icon: <Calculator className="text-gray-700 dark:text-gray-300" />,
      label: "Calculator",
      active: true,
      url: "/calculator",
    },
    {
      icon: <LucideWalletCards className="text-gray-700 dark:text-gray-300" />,
      label: "Portfolio",
      active: true,
      url: "/staking",
    },
  ];
  return (
    <aside
      className={`
          fixed lg:relative h-screen z-50
          bg-white/10 dark:bg-gray-900/80 backdrop-blur-3xl 
          border-r border-gray-200/20 dark:border-gray-700/20
          transition-all duration-300 ease-in-out
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          ${sidebarExpanded ? "w-64" : "w-20"}
        `}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-4 ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-solana-purple to-solana-green rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-xl">
                O
              </span>
            </div>
            {mobileMenuOpen && (
              <button
                className="text-gray-700 dark:text-gray-300 lg:hidden py-2 px-2 text-2xl hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                &times; {/* Close/X icon */}
              </button>
            )}
            {sidebarExpanded && (
              <span className="font-bold text-gray-900 dark:text-gray-100 text-xl whitespace-nowrap">
                Oasis
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-3 space-y-2 ">
          {NavItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              expanded={sidebarExpanded}
              badge={item.badge}
              active={isActive(item.url)}
              url={item.url}
            />
          ))}
        </nav>
      </div>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </aside>
  );
};
