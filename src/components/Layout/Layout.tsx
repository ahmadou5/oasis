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
  return (
    // 1. Use h-screen instead of min-h-screen to fix the height to the viewport.
    // 2. Add 'relative' for FluidBackground positioning if needed (optional, but safer).
    <div className="h-screen bg-gray-50 dark:bg-gray-900 font-kanit text-gray-900 dark:text-gray-100 flex relative">

      {/* 3. Ensure SideBar is designed to be full height (e.g., 'h-full' or 'h-screen' depending on its internal logic) */}
      <SideBar
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* 4. Remove min-h-screen here. The SideBar and this column now share the h-screen height. */}
      {/* 5. Add 'overflow-hidden' to the main content wrapper to prevent it from causing the whole body to scroll. */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <NewHearder setMobileMenuOpen={setMobileMenuOpen} />

        {/* 6. Ensure the main content area is the only part that scrolls vertically. 
               'overflow-y-auto' makes it scrollable if the content overflows. */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
