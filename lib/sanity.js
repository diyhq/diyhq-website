// lib/sanity.js

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const config = {
  projectId: 'plkjpsnw',
  dataset: 'production',
  apiVersion: '2023-07-08',
  useCdn: true,
}

// Exports
export const sanityClient = createClient(config)
export const getClient = () => sanityClient
export const urlFor = (source) => imageUrlBuilder(sanityClient).image(source)
