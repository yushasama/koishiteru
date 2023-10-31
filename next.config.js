/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_USER_NAME: process.env.NEXT_PUBLIC_USER_NAME
  }
}

module.exports = nextConfig
