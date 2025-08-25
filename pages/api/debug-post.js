// pages/api/debug-post.js
// Local: http://localhost:3000/api/debug-post?slug=easy-diy-garage-upgrades-for-automotive-diy-that-actually-work-fall-august
// Prod:  https://www.doityourselfhq.com/api/debug-post?slug=easy-diy-garage-upgrades-for-automotive-diy-that-actually-work-fall-august

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
        // Prefer normalized single ref 'category', then legacy 'categories[0]'
        "category": coalesce(
          category->{ _id, title, "slug": slug.current },
          categories[0]->{ _id, title, "slug": slug.current }
        ),
        body,
        difficultyLevel,
        toolsNeeded,
        materialsNeeded,
        safetyTips,
        commonMistakes
      }
    `;

    const post = await client.fetch(query, { slug });
    return res.status(200).json({ ok: true, slug, post });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
      stack: (err.stack || "").split("\n").slice(0, 6).join("\n"),
    });
  }
}
