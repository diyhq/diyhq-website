// lib/urlFor.js
// Kept for compatibility with older imports. Uses the same config as lib/sanity.

import imageUrlBuilder from '@sanity/image-url';
import { projectId, dataset } from './sanity';

const builder = imageUrlBuilder({ projectId, dataset });

export const urlFor = (source) => builder.image(source);
export default urlFor;
