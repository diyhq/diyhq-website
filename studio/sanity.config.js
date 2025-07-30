// /studio/sanity.config.js
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media' // ✅ now enabled
import { schemaTypes } from './schemaTypes'
import deskStructure from './structure/deskStructure.js'

export default defineConfig({
  name: 'default',
  title: 'DIY HQ Blog',

  projectId: 'plkjpsnw',
  dataset: 'production',

  plugins: [
    deskTool({ structure: deskStructure }),
    visionTool(),
    media(), // ✅ Media now active
  ],

  schema: {
    types: schemaTypes,
  },
})
