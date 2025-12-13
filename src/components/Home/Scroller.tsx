import { useMediaQuery } from "@/hooks/useMediaQuery";
import React from "react";

// --- Individual SVG Icon Components ---
// This makes the main component cleaner and the icons reusable.

interface Logo {
  id: number | string;
  component: React.ReactNode;
}

interface LogoScrollerProps {
  logos: Logo[];
}

// --- Main Logo Scroller Component ---
export const LogoScroller: React.FC<LogoScrollerProps> = ({ logos }) => {
  // Responsive card sizing
  const mobileBreakpoint = 768;
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const cardWidth = isMobile ? 230 : 270; // Match ValidatorTrendCard width
  const cardGap = isMobile ? 12 : 16; // Consistent gap between cards

  // Calculate total scroll width including gaps
  const totalWidth = (cardWidth + cardGap) * logos.length;

  return (
    <>
      <style>{`
        .animate-scroll {
          animation: scroll ${logos.length * 8}s linear infinite;
        }
        
        .scroller:hover .animate-scroll {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${totalWidth}px);
          }
        }
      `}</style>

      <div className="w-full flex flex-col items-center justify-center py-4 sm:py-6 font-sans">
        <div className="w-full max-w-[90vw] sm:max-w-[95vw] lg:max-w-[98vw] mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Most active validators
            </h2>
          </div>

          {/* Scroller Container */}
          <div
            className="scroller w-full overflow-hidden rounded-xl"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, white 10%, white 90%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, white 10%, white 90%, transparent 100%)",
            }}
          >
            <div
              className="animate-scroll flex items-center"
              style={{ gap: `${cardGap}px` }}
            >
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: `${cardWidth}px` }}
                >
                  {logo.component}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoScroller;
