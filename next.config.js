/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextConfig = {
  env: {
    // eslint-disable-next-line no-undef
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    // eslint-disable-next-line no-undef
    NEXT_PUBLIC_USER_NAME: process.env.NEXT_PUBLIC_USER_NAME
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Memory optimization for dev server
  experimental: {
    memoryBasedWorkersCount: true,
  },
  // Prevent memory leaks in development
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

// eslint-disable-next-line no-undef
module.exports = nextConfig
