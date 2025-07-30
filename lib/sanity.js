// lib/sanity.js

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const config = {
  projectId: 'plkjpsnw',
  dataset: 'production',
  apiVersion: '2023-07-08',
  useCdn: false, // disables stale caching
  token: process.env.NEXT_PUBLIC_SANITY_READ_TOKEN, // ✅ just the token — no Bearer!
}

export const sanityClient = createClient(config)

export const getClient = () => sanityClient

export const urlFor = (source) =>
  imageUrlBuilder(sanityClient).image(source)
