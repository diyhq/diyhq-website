// pages/post/[slug].js

import { groq } from 'next-sanity';
import { getClient } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/lib/urlFor';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Post = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading…</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.seoDescription || post.excerpt || ''} />
      </Head>

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      {post.mainImage && post.mainImage.asset && (
        <div className="mb-6">
          <Image
            src={urlFor(post.mainImage).url()}
            alt={post.imageAlt || post.title}
            width={768}
            height={400}
            className="rounded-lg object-cover"
          />
        </div>
      )}

      <div className="text-gray-700 space-y-6">
        <PortableText
          value={post.body}
          components={{
            types: {
              block: ({ children }) => <p>{children}</p>,
              image: ({ value }) => (
                value?.asset?._ref ? (
                  <Image
                    src={urlFor(value).url()}
                    alt={value.alt || 'Blog image'}
                    width={768}
                    height={400}
                    className="rounded-lg my-4"
                  />
                ) : null
              ),
              unknown: ({ value }) => (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 my-4 rounded">
                  ⚠️ Unknown block type:
                  <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ),
            },
          }}
        />
      </div>
    </article>
  );
};

export async function getStaticPaths() {
  const query = groq`*[_type == "post"]{ slug }`;
  const posts = await getClient().fetch(query);

  const paths = posts
    .filter((post) => post.slug?.current)
    .map((post) => ({
      params: { slug: post.slug.current },
    }));

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const query = groq`
    *[_type == "post" && slug.current == $slug][0]{
      title,
      slug,
      body,
      mainImage {
        asset->,
        alt
      },
      imageAlt,
      seoDescription,
      excerpt
    }
  `;

  const post = await getClient().fetch(query, { slug: params.slug });

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
}

export default Post;
