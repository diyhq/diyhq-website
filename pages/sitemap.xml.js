// pages/sitemap.xml.js
import { getAllPosts } from '@/lib/sanity-utils'; // adjust to your fetch logic

const siteUrl = 'https://diyhq.vercel.app'; // or your real domain

function generateSiteMap(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${posts
        .map((post) => {
          return `
            <url>
              <loc>${siteUrl}/post/${post.slug}</loc>
              <lastmod>${new Date(post._updatedAt).toISOString()}</lastmod>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;
}

export async function getServerSideProps({ res }) {
  const posts = await getAllPosts(); // update based on your fetch function

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
