import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'

// ✅ Correct path based on your actual folder name
import schemaTypes from './schemaTypes/index.js'

export default defineConfig({
  name: 'default',
  title: 'DIY HQ Blog',

  projectId: 'plkjpsnw',
  dataset: 'production',

  plugins: [
    media(),
    deskTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
//just a random code phrase
