"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { useTheme } from "../../context/ThemeContext";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 6000); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        `fixed inset-0 z-[999] flex items-center justify-center ${
          theme === "dark" ? "bg-black" : "bg-gray-300"
        }  transition-opacity duration-500`,
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative">
        <div className="w-auto h-auto animate-pulse rounded-xl text-6xl flex items-center justify-center flex-shrink-0 shadow-lg">
          🌴
        </div>

        <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2">
          <div
            className={`h-1 w-24 overflow-hidden rounded-full ${
              theme === "dark" ? "bg-black" : "bg-white"
            }`}
          >
            <div className="h-full w-full bg-green-500 animate-progress origin-left" />
          </div>
        </div>
      </div>
    </div>
  );
}
