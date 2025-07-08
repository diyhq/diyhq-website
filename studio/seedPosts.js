import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

dotenv.config()

const client = createClient({
  projectId: 'plkjpsnw',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2023-01-01',
})

const samplePosts = [
  {
    _type: 'post',
    title: 'Fix a Hole in Drywall Like a Pro',
    slug: { current: 'fix-hole-drywall' },
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Here’s how to patch a drywall hole easily with basic tools...',
          },
        ],
      },
    ],
    category: { _type: 'reference', _ref: 'category-home-repair-maintenance' },
  },
  {
    _type: 'post',
    title: 'Top 5 Cordless Drills in 2025',
    slug: { current: 'top-5-cordless-drills-2025' },
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Looking for the best drill? These are our top picks for 2025...',
          },
        ],
      },
    ],
    category: { _type: 'reference', _ref: 'category-tools-gear' },
  },
  {
    _type: 'post',
    title: 'Turn a Closet into an Office',
    slug: { current: 'closet-into-office' },
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Transform any closet into a mini home office with these simple steps...',
          },
        ],
      },
    ],
    category: { _type: 'reference', _ref: 'category-home-organization' },
  },
]

async function seed() {
  for (const post of samplePosts) {
    try {
      await client.create(post)
      console.log(`✅ Created post: ${post.title}`)
    } catch (err) {
      console.error(`❌ Failed to create: ${post.title} → ${err.message}`)
    }
  }
}

seed()
