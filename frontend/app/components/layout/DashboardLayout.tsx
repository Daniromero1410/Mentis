'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LogOut, Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoggingOut) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isLoggingOut, router]);

  // Inactivity Logout Logic
  useEffect(() => {
    if (!isAuthenticated) return;

    const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 hours
    let inactivityTimer: NodeJS.Timeout;

    const logoutUser = () => {
      console.log('Cerrando sesión por inactividad');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?reason=inactivity';
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logoutUser, INACTIVITY_LIMIT);
    };

    // Events to track activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Initial start
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoggingOut) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Logout animation overlay — conditional render prevents flash on page reload */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-red-600 z-[9999] flex flex-col items-center justify-center animate-in zoom-in-0 fade-in duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <div className="flex flex-col items-center justify-center text-white animate-in fade-in zoom-in-95 duration-500 delay-300">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
              <LogOut className="h-24 w-24 mb-6 relative z-10 drop-shadow-md text-white" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight shadow-sm mb-3">¡Hasta Pronto!</h2>
            <p className="text-red-100 text-lg flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cerrando sesión...
            </p>
          </div>
        </div>
      )}

      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Overlay for mobile when sidebar is open */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden anim-backdrop-in"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={`sidebar-transition ml-0 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
