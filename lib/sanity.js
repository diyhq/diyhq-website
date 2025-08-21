// lib/sanity.js
import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
export const apiVersion = process.env.SANITY_API_VERSION || '2023-10-01';

if (!projectId || !dataset) {
  // Don't throw at import time – it breaks Next build.
  console.warn('Sanity env vars missing – set SANITY_PROJECT_ID and SANITY_DATASET in Vercel.');
}

export const readClient = createClient({
  projectId, dataset, apiVersion, useCdn: true,
});

export const serverClient = createClient({
  projectId, dataset, apiVersion,
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const builder = imageUrlBuilder(readClient);
export const urlFor = (src) => (src ? builder.image(src) : null);
