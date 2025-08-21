// lib/sanity.js
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2023-10-12';

if (!projectId || !dataset) {
  // eslint-disable-next-line no-console
  console.warn('⚠️ Missing SANITY projectId/dataset env vars');
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  // server-side token only; never expose via NEXT_PUBLIC
  token: process.env.SANITY_READ_TOKEN || undefined,
  perspective: 'published',
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (src) => builder.image(src);

export const getClient = () => sanityClient;
