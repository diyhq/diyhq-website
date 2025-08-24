// pages/api/debug-category.js
import { sanityFetch } from "../../lib/sanityFetch";

/**
 * Debug endpoint: returns the raw posts the category page will render.
 * Usage: /api/debug-category?slug=automotive
 */
export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || "").trim().toLowerCase();
    if (!slug) {
      return res.status(400).json({ ok: false, error: "Missing ?slug=" });
    }

    // IMPORTANT: GROQ `match` uses * (NOT .*)
    const slugPrefix = `${slug}*`;

    const GROQ = /* groq */ `
      *[
        _type == "post" &&
        !(defined(hidden) && hidden == true) &&
        (
          (defined(category->slug.current) && category->slug.current == $slug)
          ||
          lower(replace(coalesce(category->slug.current, string(category)), "[^a-z0-9]+", "-"))
            match $slugPrefix
        )
      ]
      | order(coalesce(publishedAt, _createdAt) desc) {
        title,
        "slug": slug.current,
        "categorySlug": coalesce(
          category->slug.current,
          lower(replace(string(category), "[^a-z0-9]+", "-"))
        ),
        "categoryTitle": coalesce(category->title, string(category)),
        "imageUrl": coalesce(mainImage.asset->url, mainImageUrl),
        "publishedAt": coalesce(publishedAt, _createdAt)
      }
    `;

    const posts = (await sanityFetch(GROQ, { slug, slugPrefix })) || [];
    return res.status(200).json({
      ok: true,
      slug,
      count: posts.length,
      posts,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: String(err?.message || err) });
  }
}
