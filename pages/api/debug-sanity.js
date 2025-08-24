// pages/api/debug-sanity.js
import {hasSanityConfig, getPublicClient} from '../../lib/sanity';

export default async function handler(req, res) {
  const slug = String(req.query.slug || '');
  const cfgPresent = hasSanityConfig();

  const base = {
    hasSanityConfig: cfgPresent,
    env: {
      SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      SANITY_DATASET: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || '',
      hasToken: Boolean(process.env.SANITY_READ_TOKEN),
    }
  };

  if (!cfgPresent || !slug) {
    return res.status(200).json(base);
  }

  try {
    const client = getPublicClient();
    const q = `
      *[
        _type == "post" &&
        defined(slug.current) &&
        !(_id in path('drafts.**')) &&
        publishedAt < now() &&
        (
          category == $slug ||
          lower(replace(category, " ", "-")) == $slug ||
          (defined(category->slug.current) && category->slug.current == $slug)
        )
      ]{ "slug": slug.current }[0...50]
    `;
    const docs = await client.fetch(q, {slug});
    return res.status(200).json({...base, matchCount: docs.length, slugs: docs.map(d => d.slug)});
  } catch (e) {
    return res.status(500).json({...base, error: e.message});
  }
}
