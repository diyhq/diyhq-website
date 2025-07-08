// pages/category/[slug].js

import { createClient } from 'next-sanity'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'

const client = createClient({
  projectId: 'plkjpsnw',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-07-06',
})

export async function getServerSideProps({ params }) {
  const { slug } = params

  const category = await client.fetch(
    `*[_type == "category" && slug.current == $slug][0]`,
    { slug }
  )

  if (!category) {
    return { notFound: true }
  }

  const posts = await client.fetch(
    `*[_type == "post" && references($catId)] | order(_createdAt desc){
      _id,
      title,
      slug,
      publishedAt,
      mainImage {
        asset->{
          url
        }
      },
      excerpt
    }`,
    { catId: category._id }
  )

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
        <title>{category.title} | DIY HQ</title>
        <meta name="description" content={`Explore helpful guides and posts for ${category.title} at DIY HQ.`} />
      </Head>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">{category.title}</h1>

        {posts.length === 0 ? (
          <p className="text-gray-600">No posts found for this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link
                key={post._id}
                href={`/post/${post.slug.current}`}
                className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden"
              >
                <div>
                  {post.mainImage?.asset?.url && (
                    <Image
                      src={post.mainImage.asset.url}
                      alt={post.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
                    <p className="text-sm text-gray-600">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                    {post.excerpt && (
                      <p className="text-sm mt-2 text-gray-700">{post.excerpt}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
