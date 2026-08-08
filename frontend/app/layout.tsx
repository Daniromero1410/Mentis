import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';
import { ThemeProvider } from '@/app/context/ThemeContext';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mentis - Sistema Integral de Gestión de Reintegro Laboral Efectivo',
  description: 'Sistema Integral de Gestión de Reintegro Laboral Efectivo',
  // El favicon lo provee automáticamente app/icon.svg (Next.js App Router),
  // que es más compatible entre navegadores que servirlo desde /public.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import { Toaster } from 'sileo';

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
            <Toaster position="bottom-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}