/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false
      },
      {
        source: '/login',
        destination: '/dashboard',
        permanent: false
      },
    ];
  }
};

module.exports = nextConfig;

