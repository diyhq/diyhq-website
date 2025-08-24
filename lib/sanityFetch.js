// lib/sanityFetch.js
import {getServerClient, getPublicClient, hasSanityConfig} from './sanity';

// Keep this export so anything still importing it won't break
export const USE_CATEGORY_REFERENCE = true;

/**
 * Fetch from Sanity. On server it uses the server client (token if present),
 * on browser it automatically falls back to the public client.
 */
export async function sanityFetch(query, params = {}, opts = {}) {
  if (!hasSanityConfig()) return [];
  const onServer = typeof window === 'undefined';
  const useServer = opts.useServer ?? onServer;

  const client = useServer ? getServerClient() : getPublicClient();
  if (!client) return [];

  return client.fetch(query, params);
}
