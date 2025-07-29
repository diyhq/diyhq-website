export default {
  name: 'category',
  type: 'document',
  title: 'Category',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 } }
  ]
}
