import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { schemaTypes } from './schemas'
import { structure } from './deskStructure'

export default defineConfig({
  name: 'default',
  title: 'DIY HQ Blog',
  projectId: 'plkjpsnw',
  dataset: 'production',

  tools: [
    deskTool({ structure }),
    visionTool(),
    media(), // Enables the “Media” tab
  ],

  schema: { types: schemaTypes },
})
