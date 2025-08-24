// lib/sanity.js
import {createClient} from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// --- Sanity project config (hardcoded fallbacks) ---
const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'plkjpsnw';
const DATASET    = process.env.SANITY_DATASET    || 'production';

// NOTE: token is read from env first, then the user-provided fallback.
// If you prefer env-only later, just delete the HARDCODED_TOKEN.
const HARDCODED_TOKEN = 'skPjTS4ijIzgDMzqHXVez7nhRqSAWsC6FPabQpYxTQgEqBAerNFSrIo7LuYUs7Ky30eki9LxFHVEfId58ChIeDIXUNS89tlimrQqekgzsK1YfpXlyurepVg628ZuFBhHYiR0khLaexUhMbAB3beXyUIMOFLS9j7oZXVDqgbqCm1hWiq76M2F';
const TOKEN = process.env.SANITY_TOKEN || HARDCODED_TOKEN;

// --- Clients ---
export function getPublicClient() {
  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-08-20',
    useCdn: true,
  });
}

export function getServerClient() {
  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-08-20',
    token: TOKEN,       // needed for server/API routes/SSR
    useCdn: false,
  });
}

// --- Image URL helper ---
const builder = imageUrlBuilder(getPublicClient());
export const urlFor = (src) => builder.image(src);
