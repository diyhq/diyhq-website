// lib/sanityFetch.js
// Thin wrapper around the Sanity client + common filters/constants.

import { getClient } from './sanity';

// Common “only show public posts” filter
export const FILTER_PLAIN = `
  !(_id in path("drafts.**")) &&
  defined(slug.current) &&
  (defined(publishedAt) && publishedAt < now())
`;

// Some code imports this; export it so those imports stop failing.
// You can flip this to false later if your schema uses a string category
// instead of a reference. The category routes already support both.
export const USE_CATEGORY_REFERENCE = true;

/**
 * Fetch helper.  Use on the server (getServerSideProps, API routes).
 * Pass GROQ `query`, optional `params`, and an optional `{ tag }` object
 * if you want to leverage Next 13/14 caching tags in the future.
 */
export async function sanityFetch(query, params = {}, _opts = {}) {
  const client = getClient(true); // always use the server client on the server
  return client.fetch(query, params);
}
