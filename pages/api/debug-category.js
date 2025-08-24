// pages/api/debug-category.js
import { sanityFetch } from '../../lib/sanityFetch';

function slugify(s = '') {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default async function handler(req, res) {
  try {
    const raw = String(req.query.slug || '');
    const slug = slugify(raw);
    const slugPrefix = `${slug}*`;

    const GROQ = `
      *[
        _type == "post" &&
        defined(slug.current) &&
        !(defined(hidden) && hidden == true) &&
        (
          // Canonical reference form
          (defined(category->slug.current) && category->slug.current == $slug)
          ||
          // Legacy string form, normalized to slug, prefix tolerant
          lower(replace(coalesce(category->slug.current, string(category)), "[^a-z0-9]+", "-")) match $slugPrefix
        )
      ]
      | order(coalesce(publishedAt, _createdAt) desc) {
        title,
        "slug": slug.current,
        "excerpt": coalesce(excerpt, blurb),
        mainImage,
        publishedAt,
        _createdAt,
        // helpful for debugging
        "categorySlug": coalesce(category->slug.current, string(category)),
        "categoryTitle": coalesce(category->title, category)
      }
    `;

    const posts = (await sanityFetch(GROQ, { slug, slugPrefix })) || [];
    return res.status(200).json({ ok: true, slug, count: posts.length, posts });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
