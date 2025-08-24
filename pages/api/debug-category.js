// pages/api/debug-category.js
import { sanityFetch } from '../../lib/sanityFetch';

/**
 * Debug endpoint:
 *   /api/debug-category?slug=automotive
 * Prints raw posts JSON for the category so we can verify the GROQ.
 */
export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || '').toLowerCase().trim();
    if (!slug) {
      return res.status(400).json({ ok: false, error: 'Missing ?slug=' });
    }

    // IMPORTANT: GROQ `match` uses * as wildcard (not ".*")
    const slugPrefix = `${slug}*`;

    const GROQ = `
      *[
        _type == "post" &&
        !(defined(hidden) && hidden == true) &&
        (
          // New posts that use a category reference
          (defined(category->slug.current) && category->slug.current == $slug)
          ||
          // Legacy posts that stored a string category; slugify and prefix-match
          lower(replace(coalesce(category->slug.current, string(category)), "[^a-z0-9]+", "-")) match $slugPrefix
        )
      ]
      | order(coalesce(publishedAt, _createdAt) desc) {
        title,
        "slug": slug.current,
        excerpt,
        mainImage,
        hidden,
        "categorySlug": coalesce(category->slug.current, string(category)),
        "categoryTitle": coalesce(category->title, category),
        "publishedAt": coalesce(publishedAt, _createdAt)
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
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
