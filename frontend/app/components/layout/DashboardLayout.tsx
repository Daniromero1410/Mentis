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

// Sub-componente aislado: monta con active=false (scale-0),
// luego activa la transición en el siguiente frame de animación.
// Así replicamos el mismo efecto "círculo → pantalla completa" del login.
function LogoutOverlay() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setActive(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6 transition-opacity duration-400 ease-out ${
        active ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'linear-gradient(135deg, #8a2535, #6d1d2a)' }}
    >
      <div
        className={`flex flex-col items-center justify-center text-center text-white transition-all duration-500 delay-150 ease-out ${
          active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
          <LogOut className="h-16 w-16 sm:h-24 sm:w-24 mb-5 sm:mb-6 relative z-10 drop-shadow-md text-[#ffc600]" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 sm:mb-3">¡Hasta Pronto!</h2>
        <p className="text-white/80 text-base sm:text-lg flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cerrando sesión...
        </p>
      </div>
    </div>
  );
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

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
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
            <div className="w-16 h-16 rounded-full border-4 border-brand-500/20"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
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
      {/* Logout overlay: monta con scale-0 y activa la transición en el siguiente frame */}
      {isLoggingOut && <LogoutOverlay />}

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
