// pages/sitemap.js
import { sanityClient } from '../lib/sanity'; // this exists already

const siteUrl = 'https://diyhq.vercel.app';

function generateSiteMap(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${posts
        .map((post) => {
          return `
            <url>
              <loc>${siteUrl}/post/${post.slug.current}</loc>
              <lastmod>${new Date(post._updatedAt).toISOString()}</lastmod>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;
}

export async function getServerSideProps({ res }) {
  const query = `*[_type == "post"]{ slug, _updatedAt }`;
  const posts = await sanityClient.fetch(query);

  const sitemap = generateSiteMap(posts);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
