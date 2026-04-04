import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚠️ IMPORTANTE:
  // "export" rompe funcionalidades dinámicas (firma, API, rutas con params)
  // Se elimina para evitar problemas en producción

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;