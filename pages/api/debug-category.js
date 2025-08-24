// pages/api/debug-category.js
import { sanityFetch } from '../../lib/sanityFetch';

export default async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();
  const slugPrefix = `${slug}.*`;

  const GROQ = `
    *[
      _type == "post" &&
      defined(slug.current)
    ] | order(publishedAt desc) {
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      "categoryTitle": coalesce(category->title, category),
      "categorySlug": category->slug.current,
      publishedAt,
      hidden
    }
  `;

  try {
    const posts = await sanityFetch(GROQ);
    return res.status(200).json({ ok: true, slug, count: posts.length, posts });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
