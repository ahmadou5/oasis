"use client";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { LayoutProps } from "@/types";
import { NewHearder } from "./NewHeader";
import { SideBar } from "./sideBar";

// ... other imports

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex relative">
      <SideBar
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <NewHearder setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
