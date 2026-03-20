/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    transpilePackages: ['@tradegrid/ui', '@tradegrid/utils'],
  },
};

module.exports = nextConfig;
