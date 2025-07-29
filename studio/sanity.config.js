import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { media } from 'sanity-plugin-media'
import { visionTool } from '@sanity/vision'

import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

export default defineConfig({
  name: 'default',
  title: 'DIY HQ Studio',

  projectId: 'plkjpsnw',
  dataset: 'production',

  plugins: [
    deskTool({ structure }),
    visionTool(),
    media() // ✅ media plugin enabled
  ],

  tools: [
    deskTool({ structure }),
    visionTool()
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
