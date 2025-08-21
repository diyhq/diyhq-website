// lib/sanityFetch.js

// Our pages still import this; export it so builds don't warn/fail.
// true  -> post.category is a reference: category->slug.current
// false -> post.category is a string field
export const USE_CATEGORY_REFERENCE = true

const projectId  = process.env.SANITY_PROJECT_ID  || 'plkjpsnw'
const dataset    = process.env.SANITY_DATASET     || 'production'
const version    = process.env.SANITY_API_VERSION || '2023-10-12'
const token      = process.env.SANITY_READ_TOKEN || undefined

export async function sanityFetch(groq, params = {}) {
  const sp = new URLSearchParams({ query: groq })
  for (const [k, v] of Object.entries(params)) {
    sp.set(`$${k}`, JSON.stringify(v))
  }

  const url = `https://${projectId}.api.sanity.io/v${version}/data/query/${dataset}?${sp.toString()}`
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // cache friendly for ISR/SSG
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
  const data = await res.json()
  return data.result ?? null
}
