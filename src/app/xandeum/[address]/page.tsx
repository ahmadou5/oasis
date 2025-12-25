'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { usePnodes } from '@/hooks/usePnodes';
import { Skeleton } from '@/components/Skeleton';
import { PNodeDetailView } from '@/components/Xandeum/PNodeDetailView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PNodeDetailPage() {
  const params = useParams();
  const address = params?.address as string;
  const { pnodes, loading, error } = usePnodes();

  const pnode = pnodes.find(p => p.address === address);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <div className="card">
            <Skeleton width="w-1/3" height="h-6" />
            <div className="mt-6 grid gap-4">
              <Skeleton height="h-32" />
              <Skeleton height="h-24" />
              <Skeleton height="h-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading PNode</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/xandeum"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PNodes
          </Link>
        </div>
      </div>
    );
  }

  if (!pnode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">PNode Not Found</h2>
          <p className="text-gray-600 mb-4">The requested PNode could not be found.</p>
          <Link
            href="/xandeum"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PNodes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/xandeum"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Xandeum PNodes
          </Link>
        </nav>

        <PNodeDetailView pnode={pnode} />
      </div>
    </div>
  );
}