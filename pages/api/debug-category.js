// pages/api/debug-category.js
import { sanityFetch } from "../../lib/sanityFetch";

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || "").toLowerCase();
    const slugPrefix = `${slug}*`;

    const GROQ = /* groq */ `
      *[
        _type == "post" &&
        !(defined(hidden) && hidden == true) &&
        (
          (defined(category->slug.current) && category->slug.current == $slug) ||
          lower(replace(coalesce(category->slug.current, string(category)), "[^a-z0-9]+", "-")) match $slugPrefix
        )
      ] | order(coalesce(publishedAt, _createdAt) desc) {
        title,
        "slug": slug.current,
        excerpt,
        mainImage,
        "categoryTitle": coalesce(category->title, category),
        "categorySlug": coalesce(category->slug.current, lower(replace(string(category), "[^a-z0-9]+", "-"))),
        "publishedAt": coalesce(publishedAt, _createdAt)
      }
    `;

    const posts = (await sanityFetch(GROQ, { slug, slugPrefix })) || [];
    res.status(200).json({ ok: true, slug, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
