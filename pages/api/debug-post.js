// pages/api/debug-post.js
import { client } from "../../lib/sanity.client";

export default async function handler(req, res) {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ ok: false, error: "Missing ?slug" });

    const query = `
      *[_type == "post" && slug.current == $slug][0]{
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        excerpt,
        seoTitle,
        seoDescription,
        mainImage{
          alt,
          asset->{ _id, url, metadata{ lqip, dimensions{width,height} } }
        },
        // Support either single ref 'category' or array 'categories'
        "category": coalesce(
          category->{
            _id, title, "slug": slug.current
          },
          select(defined(categories) && count(categories) > 0,
            categories[0]->{ _id, title, "slug": slug.current },
            null
          )
        ),
        // Body may be missing or empty; we just return it raw to inspect
        body,
        // A few of your extended fields (optional)
        difficultyLevel,
        toolsNeeded,
        materialsNeeded,
        safetyTips,
        commonMistakes
      }
    `;

    const post = await client.fetch(query, { slug });
    res.status(200).json({ ok: true, slug, post });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
      stack: (err.stack || "").split("\n").slice(0, 6).join("\n"),
    });
  }
}
