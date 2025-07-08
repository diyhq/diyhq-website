import dotenv from 'dotenv'
import {createClient} from '@sanity/client'

dotenv.config()

const client = createClient({
  projectId: 'plkjpsnw',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2023-01-01',
})

const categories = [
  'Home Repair & Maintenance',
  'Tools & Gear',
  'Renovation & Remodeling',
  'Yard, Garden, & Outdoor DIY',
  'Beginner DIY Guides',
  'Smart Home & AI DIY',
  'Automotive DIY',
  'DIY Business & Side Hustles',
  'DIY Cleaning & Maintenance',
  'Home Organization',
]

async function seed() {
  for (const title of categories) {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    try {
      await client.createIfNotExists({
        _id: `category-${id}`,
        _type: 'category',
        title,
        slug: {current: id},
      })
      console.log(`✅ Created: ${title}`)
    } catch (err) {
      console.error(`❌ Failed: ${title} => ${err.message}`)
    }
  }
}

seed()
