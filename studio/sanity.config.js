import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'

import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

export default defineConfig({
  name: 'default',
  title: 'DIY HQ Studio',

  projectId: 'plkjpsnw',
  dataset: 'production',

  tools: [
    deskTool({ structure }),
    visionTool(),
    media(), // ✅ put media tool here
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    productionUrl: async (prev, { document }) => {
      return `https://doityourselfhq.com/post/${document.slug?.current}`
    },
  },
})
