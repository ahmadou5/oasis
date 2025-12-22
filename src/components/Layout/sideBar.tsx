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
  Server,
  X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { usePathname, useRouter } from "next/navigation";
import { useAppModeSwitch } from "../../hooks/useAppModeStore";
import { Router } from "next/router";

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
  mode?: "normal" | "xendium";
  url: string;
}

export const SideBar: React.FC<SideBarProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { currentMode } = useAppModeSwitch();
  const pathname = usePathname();
  const isActive = (path: string): boolean => pathname === path;
  const { theme } = useTheme();
  const router = useRouter();

  const NavItems: NavItem[] = [
    {
      icon: <Home className="text-gray-700 dark:text-gray-300" />,
      label: "Home",
      mode: "normal",
      active: true,
      url: "/",
    },
    {
      icon: <Server className="text-gray-700 dark:text-gray-300" />,
      label: "Home",
      mode: "xendium",
      active: true,
      url: "/",
    },
    {
      icon: <LucideWalletCards className="text-gray-700 dark:text-gray-300" />,
      label: "Portfolio",
      active: true,
      mode: "normal",
      url: "/staking",
    },
    {
      icon: <Calculator className="text-gray-700 dark:text-gray-300" />,
      label: "Calculator",
      mode: "normal",
      active: true,
      url: "/calculator",
    },
    {
      icon: <LucideAppWindow className="text-gray-700 dark:text-gray-300" />,
      label: "Learn Xendium",
      mode: "xendium",
      active: true,
      url: "/learn",
    },

    {
      icon: <LucideAppWindow className="text-gray-700 dark:text-gray-300" />,
      label: "Learn",
      mode: "normal",
      active: true,
      url: "/learn",
    },
  ];
  return (
    <aside
      className={`
          fixed lg:relative h-screen z-[60]
          bg-white/95 dark:bg-black/95 backdrop-blur-3xl 
          border-r border-gray-200/20 dark:border-gray-700/20
          transition-all duration-300 ease-in-out
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          w-64
        `}
    >
      <div className="flex flex-col h-full relative z-[70]">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200/10 dark:border-gray-700/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center px-2 py-2 gap-3">
              <div
                onClick={() => router.push("/")}
                className="w-10 h-10 rounded-xl text-3xl flex items-center cursor-pointer justify-center flex-shrink-0 shadow-lg"
              >
                🌴
              </div>
              <span className=" mt-1 text-gray-900 dark:text-gray-100 text-xl whitespace-nowrap">
                Oasis
              </span>
            </div>

            {/* Mobile Close Button */}
            <button
              className="text-gray-700 dark:text-gray-300 lg:hidden p-1 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-3 space-y-2 overflow-y-auto">
          {NavItems.filter((item) => item.mode === currentMode).map(
            (item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                expanded={true} // Always expanded on mobile
                badge={item.badge}
                active={isActive(item.url)}
                url={item.url}
              />
            )
          )}
        </nav>
      </div>
    </aside>
  );
};
