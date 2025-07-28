export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 }
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Short summary shown on blog cards (1–2 sentences)'
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'mainImageUrl',
      title: 'Main Image URL',
      type: 'url',
      description: 'External image URL (e.g., from GCS)'
    },
    { name: 'publishedAt', title: 'Published at', type: 'datetime' },
    {
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      readOnly: false,
      description: 'Number of times this post has been viewed',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    },
    { name: 'estimatedTime', title: 'Estimated Time', type: 'string' },
    { name: 'estimatedCost', title: 'Estimated Cost', type: 'string' },
    { name: 'difficultyLevel', title: 'Difficulty Level', type: 'string' },
    {
      name: 'toolsNeeded',
      title: 'Tools Needed',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'materialsNeeded',
      title: 'Materials Needed',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'stepByStepInstructions',
      title: 'Step-by-Step Instructions',
      type: 'array',
      of: [{ type: 'block' }]
    },
    {
      name: 'safetyTips',
      title: 'Safety Tips',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'commonMistakes',
      title: 'Common Mistakes',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'projectTags',
      title: 'Project Tags',
      type: 'array',
      of: [{ type: 'string' }]
    },
    { name: 'videoURL', title: 'Video URL', type: 'url' },
    { name: 'authorAIName', title: 'Author AI Name', type: 'string' },
    { name: 'commentsEnabled', title: 'Comments Enabled', type: 'boolean' },
    {
      name: 'updateLog',
      title: 'Update Log',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'body',
      title: 'Post Body',
      type: 'array',
      of: [{ type: 'block' }]
    },
  ],
};
