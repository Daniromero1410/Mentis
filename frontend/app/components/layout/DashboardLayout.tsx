'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 dark:border-indigo-500/30"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#b0b0b0] animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className={`sidebar-transition ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

