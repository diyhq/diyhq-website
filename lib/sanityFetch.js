// lib/sanityFetch.js
export async function sanityFetch(groq, params = {}) {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset   = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const version   = process.env.SANITY_API_VERSION || process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-10-12';
  const token     = process.env.SANITY_READ_TOKEN || process.env.NEXT_PUBLIC_SANITY_READ_TOKEN || undefined;

  if (!projectId || !dataset) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ sanityFetch: missing SANITY_PROJECT_ID / SANITY_DATASET');
    return null;
  }

  const sp = new URLSearchParams({ query: groq });
  for (const [k, v] of Object.entries(params)) {
    sp.set(`$${k}`, typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v));
  }

  const url = `https://${projectId}.api.sanity.io/v${version}/data/query/${dataset}?${sp.toString()}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 60 }, // ISR-friendly
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sanity query failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.result ?? null;
}

// true -> post.category is a reference (category->slug.current)
// false -> post.category is a string (category == $slug)
export const USE_CATEGORY_REFERENCE = true;
