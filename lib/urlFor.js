// lib/urlFor.js
import imageUrlBuilder from '@sanity/image-url';
import { readClient } from './sanity';

const builder = imageUrlBuilder(readClient);
export function urlFor(src) {
  return builder.image(src);
}
