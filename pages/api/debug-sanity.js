// pages/api/debug-sanity.js
import { getServerClient, sanityConfig, hasSanityConfig } from '../../lib/sanity';

export default async function handler(req, res) {
  try {
    const client = getServerClient();
    const count = await client.fetch('count(*[_type == "post" && !defined(hidden) || hidden == false])');
    res.status(200).json({
      ok: true,
      hasSanityConfig,
      sanityConfig,
      count,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      hasSanityConfig,
      sanityConfig,
      error: String(e?.message || e),
    });
  }
}
