// lib/sanityFetch.js
import { getServerClient, getPublicClient } from './sanity';

/**
 * Fetch through Sanity. On the server we default to the server client (with token)
 * so server-rendered pages and API routes can always reach published content.
 */
export async function sanityFetch(query, params = {}, opts = {}) {
  const client = opts.usePublic ? getPublicClient() : getServerClient();
  if (!client) return [];
  return client.fetch(query, params);
}

/**
 * Some older files in your repo import USE_CATEGORY_REFERENCE.
 * Exporting it here avoids “not exported” warnings without changing those files.
 * (The new queries work with both string-and-reference categories.)
 */
export const USE_CATEGORY_REFERENCE = true;
