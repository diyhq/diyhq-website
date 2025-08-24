// pages/api/debug-category.js
import { sanityFetch } from '../../lib/sanityFetch';

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || '').toLowerCase().trim();
    if (!slug) {
      return res.status(400).json({ ok: false, error: 'Missing ?slug', posts: [], count: 0 });
    }

    // Tolerate historical forms like "automotive-diy", "automotive-guides", etc.
    const slugMatch = `${slug}*`;

    const GROQ = `
      *[
        _type == "post" &&
        defined(slug.current) &&
        !(defined(hidden) && hidden == true) &&
        (
          (defined(category->slug.current) && category->slug.current == $slug) ||
          lower(replace(coalesce(category->slug.current, string(category)), "[^a-z0-9]+", "-")) match $slugMatch
        )
      ] | order(coalesce(publishedAt, _createdAt) desc) {
        "slug": slug.current,
        title,
        "excerpt": coalesce(excerpt, blurb),
        mainImage,
        "categorySlug": coalesce(category->slug.current, string(category)),
        "categoryTitle": coalesce(category->title, category),
        "publishedAt": coalesce(publishedAt, _createdAt)
      }
    `;

    const posts = (await sanityFetch(GROQ, { slug, slugMatch })) || [];
    return res.status(200).json({ ok: true, slug, count: posts.length, posts });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err), posts: [], count: 0 });
  }
}
