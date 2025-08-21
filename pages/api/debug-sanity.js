// pages/api/debug-sanity.js
import { sanityFetch } from '../../lib/sanityFetch'

export default async function handler(req, res) {
  try {
    const ping = await sanityFetch('*[_type == "post"][0]{_id,title, "slug": slug.current}')
    res.status(200).json({
      ok: true,
      env: {
        SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || '(fallback plkjpsnw)',
        SANITY_DATASET: process.env.SANITY_DATASET || 'production',
        HAS_TOKEN: Boolean(process.env.SANITY_READ_TOKEN),
      },
      samplePost: ping || null,
    })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}
