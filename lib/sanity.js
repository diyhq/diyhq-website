// lib/sanity.js
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

/**
 * HARD-CODED Sanity configuration (as requested)
 * If you later want to move these back to env vars, we can do that safely.
 */
const projectId = 'plkjpsnw';
const dataset   = 'production';
// Pick any pinned date; it just needs to be <= your schema deployment date
const apiVersion = '2024-08-20';

// ⚠️ You gave me this token explicitly—it's sensitive.
// Keep it only while we’re debugging, then rotate it and move it to Vercel env.
const token =
  'skPjTS4ijIzgDMzqHXVez7nhRqSAWsC6FPabQpYxTQgEqBAerNFSrIo7LuYUs7Ky30eki9LxFHVEfId58ChIeDIXUNS89tlimrQqekgzsK1YfpXlyurepVg628ZuFBhHYiR0khLaexUhMbAB3beXyUIMOFLS9j7oZXVDqgbqCm1hWiq76M2F';

// We *always* have config now (it’s hard-coded)
export const hasSanityConfig = true;

// Lazily instantiate clients so we don’t explode on import in any context.
let serverClientInstance = null;
let publicClientInstance = null;

export function getServerClient() {
  if (!serverClientInstance) {
    serverClientInstance = createClient({
      projectId,
      dataset,
      apiVersion,
      token,                // gives us access from SSR/API routes
      useCdn: false,
      perspective: 'published',
    });
  }
  return serverClientInstance;
}

export function getPublicClient() {
  if (!publicClientInstance) {
    publicClientInstance = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,         // fast + cached for client-side stuff if needed
      perspective: 'published',
    });
  }
  return publicClientInstance;
}

// Image URL helper
const builder = imageUrlBuilder({ projectId, dataset });
export function urlFor(source) {
  try {
    return builder.image(source);
  } catch {
    return null;
  }
}

// Useful for diagnostics (we never expose the token)
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  hasToken: Boolean(token),
};
