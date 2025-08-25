// pages/api/debug-sanity.js
import { client } from "../../lib/sanity.client";

export default async function handler(req, res) {
  try {
    // Simple ping + one doc probe to verify connectivity
    const countPosts = await client.fetch('count(*[_type == "post"])');
    const one = await client.fetch('*[_type == "post"][0]{ _id, "slug": slug.current }');
    res.status(200).json({
      ok: true,
      countPosts,
      sample: one || null,
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}
