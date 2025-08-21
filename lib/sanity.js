// lib/sanity.js
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET     || process.env.SANITY_DATASET || 'production';
const apiVersion= process.env.NEXT_PUBLIC_SANITY_API_VERSION  || process.env.SANITY_API_VERSION || '2023-10-12';

// Browser-safe client (no token). Use for read-only, published content and image URLs.
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// If you ever need a token client server-side:
export const getServerClient = () =>
  createClient({
    projectId,
    dataset,
    apiVersion,
    token: process.env.SANITY_READ_TOKEN, // do NOT expose publicly
    useCdn: false,
  });

export const urlFor = (src) => imageUrlBuilder(sanityClient).image(src);
