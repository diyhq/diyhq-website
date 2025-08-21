// pages/api/search.js
import { sanityFetch } from "../../lib/sanityFetch";

export default async function handler(req, res) {
  const q = String(req.query.q || "").trim();
  if (!q || q.length < 2) {
    return res.status(200).json({ ok: true, results: [] });
  }

  // Fuzzy match: title OR body text
  const groq = `
    *[_type=="post" && defined(slug.current) && publishedAt < now() && !(_id in path('drafts.**')) 
      && (title match $q || pt::text(body) match $q)
    ] | order(publishedAt desc) [0...10] {
      "slug": slug.current,
      title,
      "category": select(
        defined(category->slug.current) => category->slug.current,
        defined(category) => category,
        "uncategorized"
      ),
      "image": {"url": coalesce(mainImage.asset->url, mainImageUrl) }
    }
  `;

  const results = await sanityFetch(groq, { q: `${q}*` }) || [];
  res.status(200).json({ ok: true, results });
}
