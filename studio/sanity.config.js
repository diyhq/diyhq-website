import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'DIY HQ Blog',

  projectId: 'plkjpsnw',
  dataset: 'production',

  tools: [
    deskTool(), // ← remove structure override for sidebar view
    visionTool(),
    media(),
  ],

  schema: {
    types: schemaTypes,
  },
})
