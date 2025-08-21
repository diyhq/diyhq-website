// pages/api/search.js
import { sanityFetch } from "../../lib/sanityFetch";

export default async function handler(req, res) {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(200).json({ results: [] });

  const GROQ = `
    *[
      _type == "post" &&
      defined(slug.current) &&
      !(_id in path("drafts.**")) &&
      (hidden != true) &&
      (
        title match $q ||
        excerpt match $q ||
        pt::text(body) match $q
      )
    ] | order(publishedAt desc)[0...24]{
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      "category": coalesce(category->title, categories[0]->title, category),
      "categorySlug": coalesce(category->slug.current, categories[0]->slug.current, category),
      publishedAt
    }
  `;

  try {
    const results = (await sanityFetch(GROQ, { q: `${q}*` })) || [];
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
}
