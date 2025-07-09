// pages/category/[slug].js

import { createClient } from 'next-sanity'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PopularCarousel from '../../components/PopularCarousel'

const client = createClient({
  projectId: 'plkjpsnw',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-07-09',
})

const POSTS_PER_PAGE = 10

export async function getServerSideProps({ params, query }) {
  const { slug } = params
  const page = parseInt(query.page) || 1
  const start = (page - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE

  // ✅ Fetch the full category object
  const category = await client.fetch(
    `*[_type == "category" && slug.current == $slug][0]`,
    { slug }
  )
  console.log("📦 Category Fetched:", category)

  if (!category?._id) return { notFound: true }

  // ✅ Fetch posts using category reference
  const posts = await client.fetch(
    `*[
      _type == "post" &&
      references($categoryId) &&
      defined(publishedAt) &&
      publishedAt < now() &&
      !(_id in path("drafts.**"))
    ] | order(publishedAt desc)[$start...$end]{
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      mainImage {
        asset->{ url }
      }
    }`,
    { categoryId: category._id, start, end }
  )
  console.log("🔥 Fetched Posts:", posts)

  const total = await client.fetch(
    `count(*[
      _type == "post" &&
      references($categoryId) &&
      defined(publishedAt) &&
      publishedAt < now() &&
      !(_id in path("drafts.**"))
    ])`,
    { categoryId: category._id }
  )

  return {
    props: {
      category,
      posts,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
    },
  }
}

export default function CategoryPage({ category, posts, currentPage, totalPages }) {
  const router = useRouter()
  const { slug } = router.query

  console.log("🔄 Category Page Props:", { posts, currentPage, totalPages, category })

  const renderPagination = () => {
    const prev = currentPage > 1
    const next = currentPage < totalPages
    return (
      <div className="flex justify-center mt-8 space-x-4">
        {prev && (
          <Link href={`/category/${slug}?page=${currentPage - 1}`} className="text-blue-600">← Previous</Link>
        )}
        <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
        {next && (
          <Link href={`/category/${slug}?page=${currentPage + 1}`} className="text-blue-600">Next →</Link>
        )}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{category.title} | DIY HQ</title>
        <meta name="description" content={`Explore helpful guides and posts for ${category.title} at DIY HQ.`} />
      </Head>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">{category.title}</h1>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-gray-600">No posts found for this category yet.</p>
          ) : (
            posts.map(post => (
              <Link
                key={post._id}
                href={`/post/${post.slug.current}`}
                className="flex bg-white rounded shadow hover:shadow-md transition overflow-hidden"
              >
                {post.mainImage?.asset?.url && (
                  <div className="w-48 h-32 relative">
                    <Image
                      src={post.mainImage.asset.url}
                      alt={post.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}
                <div className="p-4 flex-1">
                  <h2 className="text-xl font-semibold mb-1">{post.title}</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  {post.excerpt && (
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {renderPagination()}

        {/* ✅ Always render carousel */}
        <div className="mt-12">
          {category && <PopularCarousel categoryId={category._id} />}

        </div>
      </main>
    </>
  )
}
