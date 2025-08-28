export async function getServerSideProps({ res }) {
  const baseUrl = "https://www.doityourselfhq.com";
  const { client } = await import("../lib/sanity.client");

  const posts = await client.fetch(`
    *[_type == "post" && defined(slug.current)]{
      "slug": slug.current,
      "updated": coalesce(publishedAt, _updatedAt, _createdAt)
    }
  `);

  const categories = await client.fetch(`
    *[_type == "category" && defined(slug.current)]{
      "slug": slug.current,
      "updated": coalesce(_updatedAt, _createdAt)
    }
  `);

  const urls = [];

  // Home
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: new Date().toISOString(),
    changefreq: "daily",
    priority: "1.0",
  });

  // Categories
  for (const c of categories) {
    urls.push({
      loc: `${baseUrl}/category/${encodeURIComponent(c.slug)}`,
      lastmod: new Date(c.updated || Date.now()).toISOString(),
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  // Posts
  for (const p of posts) {
    urls.push({
      loc: `${baseUrl}/post/${encodeURIComponent(p.slug)}`,
      lastmod: new Date(p.updated || Date.now()).toISOString(),
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `<url>
  <loc>${u.loc}</loc>
  <lastmod>${u.lastmod}</lastmod>
  <changefreq>${u.changefreq}</changefreq>
  <priority>${u.priority}</priority>
</url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function SiteMap() { return null; }
