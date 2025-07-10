// next.config.js
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap', // maps cleanly
      },
    ];
  },
};

module.exports = nextConfig;
