// pages/api/debug-category.js
import { sanityFetch } from '../../lib/sanityFetch';

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || '').toLowerCase().trim();
    if (!slug) {
      return res.status(400).json({ ok: false, error: 'Missing ?slug=' });
    }

    // For "string category" posts we do a prefix wildcard match (no regex, no replace)
    const slugPrefix = `${slug}*`;

    const GROQ = `
      *[
        _type == "post" &&
        defined(slug.current) &&
        !(_id in path('drafts.**')) &&
        (
          (defined(category->slug.current) && category->slug.current == $slug) ||
          (!defined(category._ref) && lower(string(category)) match $slugPrefix)
        )
      ] | order(coalesce(publishedAt, _createdAt) desc) {
        title,
        "slug": slug.current,
        excerpt,
        mainImage,
        // show which branch matched so we can verify data quickly
        "categorySlug": coalesce(category->slug.current, lower(string(category))),
        publishedAt,
        _createdAt
      }
    `;

    const posts = await sanityFetch(GROQ, { slug, slugPrefix });
    return res.status(200).json({
      ok: true,
      slug,
      count: Array.isArray(posts) ? posts.length : 0,
      posts: posts || [],
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
