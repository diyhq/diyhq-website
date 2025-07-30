// lib/sanity.js

import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const config = {
  projectId: 'plkjpsnw',
  dataset: 'production',
  apiVersion: '2023-07-08',
  useCdn: false, // Important: false = ensure fresh posts
  token: process.env.NEXT_PUBLIC_SANITY_READ_TOKEN, // ✅ Token injected from env
};

export const sanityClient = createClient(config);
export const getClient = () => sanityClient;
export const urlFor = (source) => imageUrlBuilder(sanityClient).image(source);
