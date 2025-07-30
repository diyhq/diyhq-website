// /pages/post/[slug].js
import { groq } from 'next-sanity'
import { getClient } from '../../lib/sanity.client'
import Image from 'next/image'
import Head from 'next/head'

const postQuery = groq`
  *[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    slug,
    mainImage { asset->{ url } },
    excerpt,
    body,
    authorAIName,
    imageAlt
  }
`

export async function getStaticProps({ params }) {
  const post = await getClient().fetch(postQuery, { slug: params.slug })
  return {
    props: { post },
    revalidate: 60, // ISR
  }
}

export async function getStaticPaths() {
  const slugs = await getClient().fetch(
    groq`*[_type == "post" && defined(slug.current)][].slug.current`
  )
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: 'blocking',
  }
}

export default function PostPage({ post }) {
  if (!post) return <p>Loading...</p>

  return (
    <>
      <Head>
        <title>{post.title} | DIY HQ</title>
        <meta name="description" content={post.excerpt || post.imageAlt} />
      </Head>
      <article className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <p className="text-sm text-gray-500 mb-4">
          Published on {new Date(post.publishedAt).toLocaleDateString()}
        </p>
        {post.mainImage?.asset?.url && (
          <Image
            src={post.mainImage.asset.url}
            alt={post.imageAlt || post.title}
            width={800}
            height={500}
            className="rounded mb-4"
          />
        )}
        <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(post.body, null, 2)}</pre>
        <p className="mt-8 text-sm text-right italic">Written by {post.authorAIName}</p>
      </article>
    </>
  )
}
