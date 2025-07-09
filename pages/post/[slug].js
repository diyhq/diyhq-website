// pages/post/[slug].js

import Image from 'next/image'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { sanityClient } from '../../lib/sanity'

export async function getServerSideProps({ params }) {
  const { slug } = params

  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    mainImage {
      asset->{ url }
    },
    excerpt,
    body,
    authorAIName
  }`

  const post = await sanityClient.fetch(query, { slug })

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
  }
}

export default function PostPage({ post }) {
  const router = useRouter()

  if (router.isFallback) {
    return <p>Loading…</p>
  }

  return (
    <>
      <Head>
        <title>{post.title} | DIY HQ</title>
        <meta name="description" content={post.excerpt || 'DIY HQ Blog Post'} />
      </Head>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 text-sm mb-6">
          {new Date(post.publishedAt).toLocaleDateString()} {post.authorAIName && ` | by ${post.authorAIName}`}
        </p>
        {post.mainImage?.asset?.url && (
          <div className="w-full h-80 relative mb-6">
            <Image
              src={post.mainImage.asset.url}
              alt={post.title}
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          </div>
        )}
        {post.body && (
          <div className="prose max-w-none">
            {Array.isArray(post.body) ? (
              post.body.map((block, i) => (
                <p key={i}>{typeof block === 'string' ? block : JSON.stringify(block)}</p>
              ))
            ) : (
              <p>{post.body}</p>
            )}
          </div>
        )}
      </main>
    </>
  )
}
