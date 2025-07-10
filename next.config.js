// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io']
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap' // this rewrite triggers sitemap.js
      }
    ];
  }
};

// Dummy comment to force redeploy
module.exports = nextConfig;
