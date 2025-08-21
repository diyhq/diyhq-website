// lib/sanity.js
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Fallbacks let the site build even if envs are missing in Vercel.
// (You should still add the envs in step 2.)
const projectId  = process.env.SANITY_PROJECT_ID  || 'plkjpsnw'
const dataset    = process.env.SANITY_DATASET     || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2023-10-12'
const token      = process.env.SANITY_READ_TOKEN || undefined

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // If we have a token we skip CDN to avoid stale content at build time.
  // If no token, use the CDN so public reads still work.
  useCdn: token ? false : true,
  token
})

export const getClient = () => sanityClient

const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source) => builder.image(source)
