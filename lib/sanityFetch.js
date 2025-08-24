// lib/sanityFetch.js
import { getServerClient, getPublicClient, hasSanityConfig } from './sanity';

// Compatibility flag (some pages import it)
export const USE_CATEGORY_REFERENCE = true;

export async function sanityFetch(query, params = {}, opts = {}) {
  const { client = 'server', perspective = 'published' } = opts;
  const c = client === 'public' ? getPublicClient() : getServerClient();

  if (!c || !hasSanityConfig()) {
    // Graceful fallback if env not present
    return [];
  }

  try {
    return await c.fetch(query, params, { perspective });
  } catch (err) {
    console.error('sanityFetch error', err?.message || err);
    return [];
  }
}
