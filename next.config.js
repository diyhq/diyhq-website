// next.config.js
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
  },
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store", // Force no caching for sitemap
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
