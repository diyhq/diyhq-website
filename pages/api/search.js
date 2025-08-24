// pages/api/search.js
import { sanityFetch } from '../../lib/sanityFetch'
import { urlFor } from '../../lib/urlFor'

export default async function handler(req, res) {
  const { q } = req.query

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter ?q=' })
  }

  const GROQ = `
    *[
      _type == "post" &&
      defined(publishedAt) &&
      !(defined(hidden) && hidden == true) &&
      (
        title match $q ||
        excerpt match $q ||
        category->title match $q
      )
    ] | order(publishedAt desc)[0...20] {
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      "categoryTitle": coalesce(category->title, category),
      publishedAt
    }
  `

  try {
    const posts = await sanityFetch(GROQ, { q: `*${q}*` })
    return res.status(200).json(posts || [])
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
