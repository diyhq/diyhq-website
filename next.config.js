/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com', pathname: '/images/**' },
      { protocol: 'https', hostname: 'ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
