export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string', // or replace with { type: 'reference', to: [{ type: 'category' }] } if you use categories
    },
    {
      name: 'publishDate',
      title: 'Publish Date',
      type: 'datetime',
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'estimatedTime',
      title: 'Estimated Time',
      type: 'string',
    },
    {
      name: 'estimatedCost',
      title: 'Estimated Cost',
      type: 'string',
    },
    {
      name: 'difficultyLevel',
      title: 'Difficulty Level',
      type: 'string',
    },
    {
      name: 'toolsNeeded',
      title: 'Tools Needed',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'materialsNeeded',
      title: 'Materials Needed',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'videoURL',
      title: 'Video URL',
      type: 'url',
    },
    {
      name: 'stepByStepInstructions',
      title: 'Step-by-Step Instructions',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'safetyTips',
      title: 'Safety Tips',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'commonMistakes',
      title: 'Common Mistakes',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'projectTags',
      title: 'Project Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'authorAIName',
      title: 'Author (AI Name)',
      type: 'string',
    },
    {
      name: 'commentsEnabled',
      title: 'Comments Enabled',
      type: 'boolean',
    },
    {
      name: 'updateLog',
      title: 'Update Log',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'readTime',
      title: 'Read Time',
      type: 'string',
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
    },
    {
      name: 'externalSourceURL',
      title: 'External Source URL',
      type: 'url',
    },
    {
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'schemaTypeVersion',
      title: 'Schema Type Version',
      type: 'string',
    },
    {
      name: 'isTestPost',
      title: 'Is Test Post?',
      type: 'boolean',
    },
    {
      name: 'pinnedCategorySortOrder',
      title: 'Pinned Category Sort Order',
      type: 'number',
    },
  ],
};
