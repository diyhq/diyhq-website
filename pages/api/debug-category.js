// pages/api/debug-category.js
import { sanityFetch } from "../../lib/sanityFetch";

/**
 * Debug endpoint: returns raw post JSON for a given category slug.
 * Works for both referenced categories and legacy string categories.
 * Example:
 *   /api/debug-category?slug=automotive
 */
export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || "").toLowerCase();
    const slugPrefix = `${slug}*`; // GROQ "match" uses '*' wildcard (NOT '.*')

    const GROQ = `
      *[
        _type == "post" &&
        defined(slug.current) &&
        !(defined(hidden) && hidden == true) &&
        (
          // 1) Newer posts that use a proper reference
          (defined(category->slug.current) && category->slug.current == $slug)
          ||
          // 2) Legacy posts where category was a string; slugify and prefix match
          lower(replace(
            select(
              defined(category->slug.current) => category->slug.current,
              defined(category)               => category,
              ""                              
            ),
            "[^a-z0-9]+",
            "-"
          )) match $slugPrefix
        )
      ]
      | order(coalesce(publishedAt, _createdAt) desc) {
        title,
        "slug": slug.current,
        excerpt,
        mainImage,
        publishedAt,
        // for visibility in the response
        "categorySlug": category->slug.current,
        "categoryTitle": category->title
      }
    `;

    const posts = (await sanityFetch(GROQ, { slug, slugPrefix })) || [];
    res.status(200).json({ ok: true, slug, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
