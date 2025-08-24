// lib/sanityFetch.js
import { getPublicClient, getServerClient } from './sanity';

export async function sanityFetch(query, params = {}) {
  // Only servers with a token should use the server client
  const isServer = typeof window === 'undefined';
  const hasToken =
    !!process.env.SANITY_READ_TOKEN || !!process.env.SANITY_API_READ_TOKEN;

  const client = isServer && hasToken ? getServerClient() : getPublicClient();

  try {
    return await client.fetch(query, params);
  } catch (err) {
    console.error('sanityFetch error:', err);
    return [];
  }
}
