// lib/sanity.js
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

// Use public envs for client-side; fall back to server envs if present
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "plkjpsnw";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";

const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  process.env.SANITY_API_VERSION ||
  "2023-10-12";

// IMPORTANT: no token in the browser
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // fast edge cache; fine for public reads
});

export const getClient = () => sanityClient;

export const urlFor = (source) => imageUrlBuilder(sanityClient).image(source);
