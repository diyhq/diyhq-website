import { groq } from 'next-sanity'
import { getClient } from '../../lib/sanity.server'
import Head from 'next/head'

export async function getStaticPaths() {
  const query = groq`*[_type == "category"]{ "slug": slug }`
  const categories = await getClient().fetch(query)

  const paths = categories.map((cat) => ({
    params: { slug: cat.slug?.current || cat.slug }
  }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params

  const categoryQuery = groq`
    *[_type == "category" && slug.current == $slug][0]
  `
  const postsQuery = groq`
    *[_type == "post" && references(*[_type == "category" && slug.current == $slug]._id)] | order(_createdAt desc) {
      _id, title, slug, mainImage, publishedAt, body
    }
  `

  const category = await getClient().fetch(categoryQuery, { slug })
  const posts = await getClient().fetch(postsQuery, { slug })

  if (!category) {
    return { notFound: true }
  }

  return {
    props: {
      category,
      posts,
    },
  }
}

export default function CategoryPage({ category, posts }) {
  return (
    <>
      <Head>
        <title>{category.title} – DIY HQ</title>
      </Head>
      <main>
        <h1>{category.title}</h1>
        {posts.length === 0 ? (
          <p>No posts in this category yet.</p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post._id}>
                <a href={`/post/${post.slug.current}`}>{post.title}</a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
