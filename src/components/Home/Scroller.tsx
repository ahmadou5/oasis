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
  // Each logo container has a fixed width.
  const mobileBreakpoint = 768;
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const logoWidth = isMobile ? 210 : 250;
  // Calculate the total width for the animation translate.
  const scrollWidth = logoWidth * logos.length;

  return (
    <>
      {/* Injecting global styles for the animation.
              This is a clean way to handle keyframe animations within a 
              self-contained component.
            */}
      <style>{`
                .animate-scroll {
                    animation: scroll ${logos.length * 6}s linear infinite;
                }
                
                .scroller:hover .animate-scroll {
                    animation-play-state: paused;
                }

                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(calc(-${scrollWidth}px));
                    }
                }
            `}</style>

      <div className=" w-full ml-auto mr-auto flex flex-col items-center justify-center py-8 font-sans">
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* The scroller container with a gradient mask to fade the edges.
                      This creates a seamless visual effect.
                    */}
          <div
            className="scroller w-full overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent, white 20%, white 80%, transparent)",
              maskImage:
                "linear-gradient(to right, transparent, white 20%, white 80%, transparent)",
            }}
          >
            <div className="animate-scroll flex w-max items-center">
              {/* Render the duplicated logos for the infinite loop */}
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center"
                  style={{ width: `${logoWidth}px` }}
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
