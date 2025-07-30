// /studio/sanity.config.js
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media' // optional
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'DIY HQ Blog',

  projectId: 'plkjpsnw',
  dataset: 'production',

  tools: [
    deskTool(),
    visionTool(),
    media(), // remove this line if media crashes again
  ],

  schema: {
    types: schemaTypes,
  },
})
