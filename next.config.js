/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  // Enable Next/Image for Sanity + Amazon product thumbnails
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Sanity
      { protocol: 'https', hostname: 'cdn.sanity.io' },

      // Amazon product images (old + new hosts)
      { protocol: 'https', hostname: 'm.media-amazon.com', pathname: '/images/*' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com', pathname: '/images/*' },
      { protocol: 'https', hostname: 'ssl-images-amazon.com', pathname: '/images/*' },
    ],
  },

  // Keep sitemap fresh (no CDN/browser caching) and correct MIME
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
