// lib/sanityFetch.js
export async function sanityFetch(groq, params = {}) {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset   = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const version   = process.env.SANITY_API_VERSION || process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-10-12";
  const token     = process.env.SANITY_READ_TOKEN || undefined;

  if (!projectId) throw new Error("Missing SANITY_PROJECT_ID");
  const sp = new URLSearchParams({ query: groq });
  for (const [k, v] of Object.entries(params)) {
    sp.set(`$${k}`, JSON.stringify(v));
  }

  const url = `https://${projectId}.api.sanity.io/v${version}/data/query/${dataset}?${sp.toString()}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  const data = await res.json();
  return data.result ?? null;
}
