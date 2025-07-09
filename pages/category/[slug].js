// pages/category/[slug].js

import Head from 'next/head'
import Link from 'next/link'
import { sanityClient } from '../../lib/sanity'

const POSTS_PER_PAGE = 15

export async function getServerSideProps({ params, query }) {
  const { slug } = params
  const currentPage = parseInt(query.page || '1', 10)
  const start = (currentPage - 1) * POSTS_PER_PAGE

  const totalQuery = `count(*[_type == "post" && category->slug.current == $slug])`
  const postsQuery = `*[_type == "post" && category->slug.current == $slug]
    | order(publishedAt desc)
    [${start}...${start + POSTS_PER_PAGE}] {
      title,
      slug,
      publishedAt,
      excerpt
    }`

  const [totalPosts, posts] = await Promise.all([
    sanityClient.fetch(totalQuery, { slug }),
    sanityClient.fetch(postsQuery, { slug }),
  ])

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)

  return {
    props: {
      slug,
      posts: posts || [], // fallback if null
      currentPage,
      totalPages,
    },
  }
}

export default function CategoryPage({ slug, posts, currentPage, totalPages }) {
  const capitalized = slug.replace(/-/g, ' ')

  return (
    <>
      <Head>
        <title>{capitalized} | DIY HQ</title>
        <meta name="description" content={`DIY HQ blog posts in ${slug} category`} />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-start px-4 py-16">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-bold text-center mb-10 capitalize">{capitalized}</h1>

          {posts.length === 0 ? (
            <p className="text-center text-gray-600">No posts found in this category.</p>
          ) : (
            <ul className="space-y-12">
              {posts.map((post) => (
                <li key={post.slug?.current || post.title} className="border-b pb-6">
                  {post.slug?.current ? (
                    <Link
                      href={`/post/${post.slug.current}`}
                      className="text-2xl text-blue-600 hover:underline block"
                    >
                      {post.title}
                    </Link>
                  ) : (
                    <span className="text-2xl text-gray-500">{post.title}</span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : 'Date unknown'}
                  </p>
                  {post.excerpt && (
                    <p className="text-gray-700 mt-2">{post.excerpt}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center gap-4 mt-12">
            {currentPage > 1 && (
              <Link
                href={`/category/${slug}?page=${currentPage - 1}`}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ← Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/category/${slug}?page=${currentPage + 1}`}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
