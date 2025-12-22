"use client";

import React from "react";
import { usePnodes } from "../../hooks/usePnodes";

export default function XandeumPage() {
  const { pnodes, loading, error, refetch } = usePnodes();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>loading</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <p>Hey </p>
    </div>
  );
}
