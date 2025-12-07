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
    <div className="h-screen bg-gray-50 dark:bg-black  text-gray-900 dark:text-gray-100 flex relative">
      <SideBar
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <NewHearder setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
