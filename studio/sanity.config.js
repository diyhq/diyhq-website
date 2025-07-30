// /studio/sanity.config.js

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
    deskTool({
      structure: (S) =>
        S.list()
          .title('Main')
          .items([
            S.documentTypeListItem('post').title('Posts'),
            S.documentTypeListItem('category').title('Categories'),
          ]),
    }),
    visionTool(),
    media(),
  ],

  schema: {
    types: schemaTypes,
  },

  // Optional: Removes extra UI (like releases nav bar if it's stuck)
  __experimental_theme: {
    components: {
      navbar: () => null,
    },
  },
})
