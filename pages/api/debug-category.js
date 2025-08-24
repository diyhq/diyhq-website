// pages/api/debug-category.js
import { getServerClient } from '../../lib/sanity';

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || '').toLowerCase().trim();
    if (!slug) return res.status(400).json({ ok: false, error: 'Missing ?slug=' });

    // !!! IMPORTANT: GROQ match uses "*" (glob), not ".*" (regex)
    const slugPrefix = `${slug}*`;

    const GROQ = `
      *[
        _type == "post" &&
        !(defined(hidden) && hidden == true) &&
        (
          (defined(category->slug.current) && category->slug.current == $slug)
          ||
          lower(replace(coalesce(category->slug.current, string(category)), "[^a-z0-9]+", "-")) match $slugPrefix
        )
      ]
      | order(coalesce(publishedAt, _createdAt) desc) {
        title,
        "slug": slug.current,
        excerpt,
        mainImage,
        "categorySlug": coalesce(category->slug.current, lower(replace(string(category), "[^a-z0-9]+", "-"))),
        "categoryTitle": coalesce(category->title, category),
        publishedAt,
        _createdAt
      }
    `;

    const client = getServerClient();
    const posts = await client.fetch(GROQ, { slug, slugPrefix });
    return res.status(200).json({ ok: true, slug, slugPrefix, count: posts?.length || 0, posts });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
