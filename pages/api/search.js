// pages/api/search.js
import { sanityFetch } from '../../lib/sanityFetch';

export default async function handler(req, res) {
  const q = String(req.query.q || '').trim();

  if (!q) {
    res.status(200).json({ ok: true, count: 0, results: [] });
    return;
  }

  const query = `
    *[_type == "post" 
      && defined(slug.current) 
      && !(_id in path("drafts.**"))
      && hidden != true
      && (
        title match $term || excerpt match $term || coalesce(body[].children[].text, "") match $term
      )
    ] | order(coalesce(publishedAt, _createdAt) desc)[0...20] {
      title,
      "slug": slug.current,
      excerpt
    }
  `;

  const results = (await sanityFetch(query, { term: `${q}*` })) || [];

  res.status(200).json({
    ok: true,
    count: results.length,
    results,
  });
}
