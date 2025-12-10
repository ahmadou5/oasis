'use client';

import DashboardCards from '@/components/DashboardCards';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-green"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <DashboardCards />
    </div>
  );
}