import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizaciones para produccion
  reactStrictMode: true,

  // Configuracion de imagenes si se usan dominios externos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Variables de entorno disponibles en el cliente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Configuracion para Vercel - outputs standalone para optimizacion
  output: 'standalone',
};

export default nextConfig;
