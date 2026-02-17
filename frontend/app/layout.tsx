import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';
import { ThemeProvider } from '@/app/context/ThemeContext';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mentis - Sistema Integral de Psicología Ocupacional',
  description: 'Sistema Integral de Psicología Ocupacional y Pruebas de Trabajo',
  icons: {
    icon: '/images/mentis-mini.svg',
    shortcut: '/images/mentis-mini.svg',
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="bottom-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}