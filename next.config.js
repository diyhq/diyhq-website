const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false, // ← ADD THIS LINE
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
            value: "no-store",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
