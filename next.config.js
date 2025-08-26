/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  i18n: {
    locales: ["en", "es", "fr"],
    defaultLocale: "en",
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },

      // Amazon images (direct)
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "ssl-images-amazon.com" },

      // Amazon Associate image endpoint (AsinImage)
      { protocol: "https", hostname: "ws-na.amazon-adsystem.com" },
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
