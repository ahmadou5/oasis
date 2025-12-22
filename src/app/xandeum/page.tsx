"use client";

import React from "react";
import { usePnodes } from "@/hooks/usePnodes";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { XandeumHero } from "@/components/Xandeum/XandeumHero";
import { PNodesList } from "@/components/Xandeum/PNodesList";
import { XandeumAnalytics } from "@/components/Xandeum/XandeumAnalytics";
import { XandeumWorldMap } from "../../components/Xandeum/XandeumWorldMap";
import { PNodeMap } from "../../components/Xandeum/PNodeMap";

export default function XandeumPage() {
  const { pnodes, loading, error, refetch } = usePnodes();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Xandeum PNodes
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <XandeumHero />
      <PNodeMap pnodes={pnodes} />

      {/* Analytics Overview */}
      <XandeumAnalytics pnodes={pnodes} />

      {/* PNodes List */}
      <PNodesList pnodes={pnodes} />
    </div>
  );
}
