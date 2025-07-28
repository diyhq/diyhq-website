import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import structure from './structure'

import schemaTypes from './schemaTypes/index.js'

export default defineConfig({
  name: 'default',
  title: 'DIY HQ Blog',

  projectId: 'plkjpsnw',
  dataset: 'production',

  plugins: [
    media(),
    deskTool({ structure }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
