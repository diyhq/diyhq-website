// pages/sitemap.xml.js

export async function getServerSideProps({ res }) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://diyhq.vercel.app/post/test-for-the-best-drill</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
  </urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

// ✅ Required to prevent build failure
export default function Sitemap() {
  return null;
}
