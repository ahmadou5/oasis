import { ENV } from "@/config/env";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown, LucideIcon } from "lucide-react";
import Link from "next/link";

// Sidebar Item Component
export const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  expanded?: boolean;
  hasDropdown?: boolean;
  url: string;
}> = ({ icon, label, active, badge, expanded, hasDropdown, url }) => {
  const { theme } = useTheme();
  return (
    <Link
      href={`${ENV.BASE_URL}${url}`}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
        active
          ? "bg-green-400/10 border border-green-700/50 shadow-sm shadow-green-200/20"
          : "hover:bg-gray-200/20 dark:hover:bg-gray-800/20"
      }`}
      title={!expanded ? label : undefined}
      //onClick={() => alert(`Clicked on ${label}`)}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      {expanded && (
        <>
          <span className="text-sm text-gray-900 dark:text-gray-100 font-medium flex-1 text-left whitespace-nowrap">
            {label}
          </span>
          {badge && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-xs rounded-md font-bold shadow-lg shadow-green-500/30">
              {badge}
            </span>
          )}
          {hasDropdown && (
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                active ? "rotate-180" : ""
              }`}
            />
          )}
        </>
      )}

      {/* Tooltip for collapsed state */}
      {!expanded && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-gray-600/50 dark:border-gray-600/50 z-50">
          {label}
          {badge && (
            <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-xs rounded-md font-bold">
              {badge}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
