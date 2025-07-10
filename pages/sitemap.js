// pages/sitemap.js
import { sanityClient } from '../lib/sanity';

export async function getServerSideProps({ res }) {
  const query = `*[_type == "post"]{ slug, _updatedAt }`;
  const posts = await sanityClient.fetch(query);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts
    .map((post) => {
      return `
    <url>
      <loc>https://diyhq.vercel.app/post/${post.slug.current}</loc>
      <lastmod>${new Date(post._updatedAt).toISOString()}</lastmod>
    </url>`;
    })
    .join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
