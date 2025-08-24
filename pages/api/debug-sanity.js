// pages/api/debug-sanity.js
import { hasSanityConfig, getServerClient } from '../../lib/sanity';

export default async function handler(req, res) {
  const out = {
    hasSanityConfig: hasSanityConfig(),
    env: {
      // show what the server resolved to (never echo token)
      SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || 'plkjpsnw',
      SANITY_DATASET: process.env.SANITY_DATASET || 'production',
      hasToken: Boolean(process.env.SANITY_READ_TOKEN || true)
    }
  };

  try {
    // simple ping to prove the client can read published content
    const anyPostId = await getServerClient().fetch(
      '*[_type=="post" && !(_id in path("drafts.**"))][0]._id'
    );
    out.samplePostId = anyPostId || null;
  } catch (err) {
    out.error = String(err?.message || err);
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(out));
}
