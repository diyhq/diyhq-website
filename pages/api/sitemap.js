// pages/api/sitemap.js
import { sanityClient } from '../../lib/sanity';

const siteUrl = 'https://diyhq.vercel.app';

export default async function handler(req, res) {
  const query = `*[_type == "post"]{ slug, _updatedAt }`;
  const posts = await sanityClient.fetch(query);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts
    .map((post) => {
      return `
    <url>
      <loc>${siteUrl}/post/${post.slug.current}</loc>
      <lastmod>${new Date(post._updatedAt).toISOString()}</lastmod>
    </url>`;
    })
    .join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(sitemap);
}
