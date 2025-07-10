// pages/api/sitemap.js

export default function handler(req, res) {
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://diyhq.vercel.app/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`);
}
