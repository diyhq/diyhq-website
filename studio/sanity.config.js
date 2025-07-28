import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';

import schemaTypes from './schemas';

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
});
// Triger rebuild