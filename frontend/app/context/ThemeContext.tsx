'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Modo oscuro deshabilitado - siempre en modo claro
  const [theme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Forzar modo claro y remover cualquier clase dark
    document.documentElement.classList.remove('dark');
    // Limpiar localStorage para evitar conflictos
    localStorage.removeItem('theme');
  }, []);

  const setTheme = () => {
    // Deshabilitado - siempre permanece en light
    console.warn('El modo oscuro está deshabilitado');
  };

  const toggleTheme = () => {
    // Deshabilitado - no hace nada
    console.warn('El modo oscuro está deshabilitado');
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
}