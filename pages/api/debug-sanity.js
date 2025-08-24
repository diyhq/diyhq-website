// pages/api/debug-sanity.js
import { sanityFetch } from '../../lib/sanityFetch';

export default async function handler(req, res) {
  const slug = String((req.query.slug || '').toString().trim().toLowerCase());
  const alts = Array.from(
    new Set([
      slug,
      slug.replace(/-/g, ' '),
      slug.replace(/-/g, ''),
    ].map((s) => s.toLowerCase()))
  );

  const q = `
    *[
      _type == "post" &&
      defined(slug.current) &&
      !(_id in path('drafts.**')) &&
      publishedAt < now() &&
      !coalesce(hidden, false) &&
      lower(coalesce(category->slug.current, category)) in $alts
    ] | order(publishedAt desc){
      "slug": slug.current,
      title,
      "cat": coalesce(category->slug.current, category)
    }
  `;

  const docs = await sanityFetch(q, { alts });
  res.status(200).json({ count: docs?.length || 0, items: docs || [] });
}
