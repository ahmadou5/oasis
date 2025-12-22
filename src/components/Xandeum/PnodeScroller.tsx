"use client";

import React, { useMemo } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { XandeumNodeWithMetrics } from "@/types";
import { PNodeTrendCard } from "./PnodeTrend";

interface PNodeScrollerProps {
  pnodes: XandeumNodeWithMetrics[];
  onPNodeSelect?: (pnode: XandeumNodeWithMetrics) => void;
}

export const PNodeScroller: React.FC<PNodeScrollerProps> = ({
  pnodes,
  onPNodeSelect,
}) => {
  // Filter only online PNodes
  const onlinePNodes = useMemo(() => {
    return pnodes.filter((pnode) => pnode.isOnline);
  }, [pnodes]);

  // Responsive card sizing
  const mobileBreakpoint = 768;
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const cardWidth = isMobile ? 230 : 270;
  const cardGap = isMobile ? 12 : 16;

  // Calculate total scroll width including gaps
  const totalWidth = (cardWidth + cardGap) * onlinePNodes.length;

  // If no online PNodes, show a message
  if (onlinePNodes.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8 font-sans">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Active PNodes
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            No online PNodes available at the moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .animate-pnode-scroll {
          animation: pnodeScroll ${onlinePNodes.length * 8}s linear infinite;
        }
        
        .pnode-scroller:hover .animate-pnode-scroll {
          animation-play-state: paused;
        }

        @keyframes pnodeScroll {
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
              Active Nodes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {onlinePNodes.length} nodes online
            </p>
          </div>

          {/* Scroller Container */}
          <div
            className="pnode-scroller w-full overflow-hidden rounded-xl"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, white 10%, white 90%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, white 10%, white 90%, transparent 100%)",
            }}
          >
            <div
              className="animate-pnode-scroll flex items-center"
              style={{ gap: `${cardGap}px` }}
            >
              {onlinePNodes.map((pnode, index) => (
                <div
                  key={`${pnode.pubkey}-${index}`}
                  className="flex-shrink-0"
                  style={{ width: `${cardWidth}px` }}
                >
                  <PNodeTrendCard
                    pnode={pnode}
                    onSelect={() => onPNodeSelect?.(pnode)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PNodeScroller;
