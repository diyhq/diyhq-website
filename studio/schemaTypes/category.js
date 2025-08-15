// studio/schemas/category.js (or wherever your schema lives)
export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        // Ensures: "Tools & Gear" -> "tools-gear"
        slugify: input =>
          input
            .toLowerCase()
            .replace(/&/g, '')           // drop ampersands
            .replace(/[^\w\s-]/g, '')    // strip punctuation
            .trim()
            .replace(/\s+/g, '-')        // spaces -> hyphen
            .replace(/-+/g, '-')         // collapse dup hyphens
      },
      validation: Rule => Rule.required()
    }
  ]
}
