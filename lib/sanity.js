// lib/sanity.js
import {createClient} from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2024-06-01';

if (!projectId) throw new Error('Missing SANITY_PROJECT_ID');
if (!dataset) throw new Error('Missing SANITY_DATASET');

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  perspective: 'published',
  useCdn: true,                      // serves published content fast
  token: process.env.SANITY_READ_TOKEN || undefined, // ok if undefined
});

const builder = imageUrlBuilder(client);
export const urlFor = (src) => builder.image(src);
