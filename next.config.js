/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  async redirects() {
    return [
      {
        source: '/blog/reverse-engineering-an-asic-with-geometry-graph-theory-and-cigarette-breaks',
        destination: '/blog/reincarnated-as-an-unemployed-cs-student-who-reversed-engineered-an-asic',
        permanent: true,
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_USER_NAME: process.env.NEXT_PUBLIC_USER_NAME
  },
  images: {
    qualities: [75, 90, 95],
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
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
  },
}

module.exports = nextConfig
