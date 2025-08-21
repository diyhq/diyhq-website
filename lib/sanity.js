// lib/sanity.js
// Centralized Sanity client + image URL helper.
// Works both locally and on Vercel. Looks for either NEXT_PUBLIC_* or server-only
// env names so you don't have to rename what you already have.

import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Read env in a forgiving way (supports both old and new names)
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID;

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  'production';

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  process.env.SANITY_API_VERSION ||
  '2024-08-01';

// Token is optional (used on the server for private reads if present)
const token =
  process.env.SANITY_READ_TOKEN ||
  process.env.NEXT_PUBLIC_SANITY_READ_TOKEN ||
  process.env.SANITY_TOKEN ||
  undefined;

// Be chatty in logs if something critical is missing (but don't crash here)
if (!projectId || !dataset) {
  // If these are missing, Next build/SSR will fail when a page fetches.
  // This log is to make the problem obvious in Vercel without throwing here.
  console.error(
    'Sanity env vars missing – set SANITY_PROJECT_ID and SANITY_DATASET (or NEXT_PUBLIC_… variants) in Vercel.'
  );
}

const baseConfig = {
  projectId,
  dataset,
  apiVersion,
  // Use CDN for speed on the public client
  useCdn: true,
  // Only published content by default
  perspective: 'published',
};

// Public client (browser-safe)
export const sanityClient = createClient(baseConfig);

// Server client (disables CDN + adds token if available)
export const serverClient = createClient({
  ...baseConfig,
  useCdn: false,
  token, // undefined is fine; client simply behaves like public
});

// Helper to pick the right client
export const getClient = (isServer = typeof window === 'undefined') =>
  isServer ? serverClient : sanityClient;

// Image URL helper (exported here for convenience)
const builder = imageUrlBuilder({ projectId, dataset });
export const urlFor = (source) => builder.image(source);

// Default export keeps older imports working: `import client from 'lib/sanity'`
export default sanityClient;
