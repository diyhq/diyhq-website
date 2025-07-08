// lib/sanity.js
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'plkjpsnw',         // ✅ your real project ID
  dataset: 'production',         // or 'development' if you set that
  useCdn: true,                  // cache for speed
  apiVersion: '2024-06-01',      // YYYY-MM-DD format (recent date is fine)
});
