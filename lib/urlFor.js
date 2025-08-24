// lib/urlFor.js
import imageUrlBuilder from '@sanity/image-url';

// Read env directly here to avoid circular imports with lib/sanity.js
const projectId =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset =
  process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const builder = imageUrlBuilder({ projectId, dataset });

export function urlFor(source) {
  return builder.image(source);
}
