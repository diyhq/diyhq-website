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

  plugins: [], // 🔕 No longer needed — replaced with `tools`

  tools: [
    deskTool({ structure }), // ✅ Keeps your custom desk layout
    visionTool(),            // ✅ Optional but working fine
    media(),                 // ✅ Shows "Media" tab in sidebar
  ],

  schema: {
    types: schemaTypes,
  },
})
//force rebuild