/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    domains: ["cdn.sanity.io"],
  },
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          // prevent CDN/browser caching; always serve fresh
          { key: "Cache-Control", value: "no-store" },
          // optional: ensure correct mime (your page likely sets it already)
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
