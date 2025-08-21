// pages/api/debug-category/[slug].js
import { sanityFetch } from "../../../lib/sanityFetch";

export default async function handler(req, res) {
  const slug = String(req.query.slug || "").trim();
  if (!slug) return res.status(400).json({ error: "missing slug" });

  const q = `
  {
    "catId": *[_type == "category" && slug.current == $slug][0]._id,
    "items": *[
      _type == "post" &&
      defined(slug.current) &&
      !(_id in path("drafts.**")) &&
      publishedAt < now() &&
      (
        (defined(^.catId) && references(^.catId)) ||
        lower(replace(string(category), " ", "-")) == $slug
      )
    ] | order(publishedAt desc){
      title, "slug": slug.current,
      "catTitle": coalesce(category->title, string(category))
    }
  }`;
  const data = await sanityFetch(q, { slug });
  res.status(200).json({ slug, matched: data?.items?.length || 0, items: data?.items || [] });
}
