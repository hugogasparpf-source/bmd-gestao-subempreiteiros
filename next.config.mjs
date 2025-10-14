/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Configurações de servidor para garantir funcionamento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
  
  // Configurações de imagem
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configurações experimentais otimizadas
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configuração de webpack para resolver problemas de build
  webpack: (config, { isServer }) => {
    // Resolver problemas de fallback para o cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }
    
    // Otimizações de performance
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    }
    
    return config
  },
  
  // Transpilação de pacotes necessários
  transpilePackages: ['lucide-react'],
  
  // Configurações de output para garantir compatibilidade
  output: 'standalone',
}

export default nextConfig