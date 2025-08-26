/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  images: {
    // keep domains for simple allow-list lookups
    domains: ["cdn.sanity.io"],

    // use remotePatterns for granular remote image hosts (Amazon, etc.)
    remotePatterns: [
      // Sanity (CDN)
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },

      // Amazon product images (current + legacy hosts)
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "ssl-images-amazon.com",
        pathname: "/images/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
