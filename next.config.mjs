/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações mínimas essenciais
  poweredByHeader: false,
  
  // Configurações de imagem básicas
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp'],
  },
  
  // Configurações experimentais mínimas
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Pacotes externos para server components
  serverExternalPackages: ['@supabase/supabase-js'],
}

export default nextConfig