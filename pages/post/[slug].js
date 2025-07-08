// pages/post/[slug].js

import { createClient } from 'next-sanity';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import { PortableText } from '@portabletext/react';

const client = createClient({
  projectId: 'plkjpsnw',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: true,
});

export async function getServerSideProps({ params }) {
  const { slug } = params;

  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      slug,
      publishedAt,
      body,
      mainImage {
        asset->{
          url
        }
      }
    }`,
    { slug }
  );

  return {
    props: {
      post,
    },
  };
}

export default function PostPage({ post }) {
  const router = useRouter();

  if (!post) return <div>Post not found.</div>;

  return (
    <>
      <Head>
        <title>{post.title} | DIY HQ</title>
        <meta name="description" content={`Read more about ${post.title} on DIY HQ.`} />
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        {post.publishedAt && (
          <p className="text-sm text-gray-500 mb-6">
            {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        )}

        {post.mainImage?.asset?.url && (
          <div className="mb-8">
            <Image
              src={post.mainImage.asset.url}
              alt={post.title}
              width={800}
              height={400}
              className="rounded"
            />
          </div>
        )}

        <article className="prose max-w-none">
          <PortableText value={post.body} />
        </article>
      </main>
    </>
  );
}
