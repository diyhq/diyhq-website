/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  // Images (Next/Image + plain <img> fallback in affiliate cards)
  images: {
    domains: ["cdn.sanity.io"],
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/images/**" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com", pathname: "/images/**" },
      { protocol: "https", hostname: "ssl-images-amazon.com", pathname: "/images/**" },
    ],
  },

  // i18n scaffold: EN default + ES
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    localeDetection: true,
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
