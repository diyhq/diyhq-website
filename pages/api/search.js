// pages/api/search.js
import { sanityFetch } from "../../lib/sanityFetch";

export default async function handler(req, res) {
  const term = String(req.query.q || "").trim();

  if (!term) {
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ results: [] });
  }

  const GROQ = `
    *[
      _type == "post"
      && defined(slug.current)
      && !(_id in path("drafts.**"))
      && (!defined(hidden) || hidden == false)
      && (
        title match $q
        || excerpt match $q
        // If you want body search later, we can add a safe version.
      )
    ] | order(publishedAt desc) [0...24]{
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      "categoryTitle": coalesce(category->title, category),
      "category": coalesce(category->slug.current, category),
      publishedAt
    }
  `;

  try {
    const results = (await sanityFetch(GROQ, { q: `${term}*` })) ?? [];
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ results });
  } catch (err) {
    console.error("Search API error:", err);
    return res.status(500).json({ error: "Search failed" });
  }
}
