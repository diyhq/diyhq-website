// pages/post/[slug].js

import { useRouter } from 'next/router';
import Head from 'next/head';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../lib/urlFor';
import { PortableText } from '@portabletext/react';

export default function Post({ post }) {
  const router = useRouter();

  if (router.isFallback) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <>
      <Head>
        <title>{post.title} | DIY HQ</title>
        <meta name="description" content={post.seoDescription || post.excerpt || post.title} />
      </Head>

      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        {post.mainImage?.asset?._ref && (
          <img
            src={urlFor(post.mainImage).width(800).url()}
            alt={post.imageAlt || post.title}
            className="w-full rounded-lg mb-4"
          />
        )}

        <div className="text-sm text-gray-500 mb-2">
          {new Date(post.publishedAt).toLocaleDateString()}
        </div>

        <article className="prose max-w-none mb-8">
          <PortableText value={post.body} />
        </article>

        {post.difficultyLevel && <p><strong>Difficulty:</strong> {post.difficultyLevel}</p>}
        {post.estimatedTime && <p><strong>Time Required:</strong> {post.estimatedTime}</p>}
        {post.estimatedCost && <p><strong>Estimated Cost:</strong> {post.estimatedCost}</p>}

        {post.toolsNeeded?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold">Tools Needed</h2>
            <ul className="list-disc list-inside">
              {post.toolsNeeded.map((tool, idx) => <li key={idx}>{tool}</li>)}
            </ul>
          </div>
        )}

        {post.materialsNeeded?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold">Materials Needed</h2>
            <ul className="list-disc list-inside">
              {post.materialsNeeded.map((mat, idx) => <li key={idx}>{mat}</li>)}
            </ul>
          </div>
        )}

        {post.safetyTips?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold">Safety Tips</h2>
            <ul className="list-disc list-inside">
              {post.safetyTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          </div>
        )}

        {post.commonMistakes?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold">Common Mistakes</h2>
            <ul className="list-disc list-inside">
              {post.commonMistakes.map((mistake, idx) => <li key={idx}>{mistake}</li>)}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}

export async function getStaticProps({ params }) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    body,
    mainImage,
    imageAlt,
    publishedAt,
    category->{title},
    authorAIName,
    seoDescription,
    excerpt,
    estimatedCost,
    estimatedTime,
    difficultyLevel,
    toolsNeeded,
    materialsNeeded,
    safetyTips,
    commonMistakes
  }`;

  const post = await sanityClient.fetch(query, { slug: params.slug });

  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const query = `*[_type == "post" && defined(slug.current)][]{ "slug": slug.current }`;
  const posts = await sanityClient.fetch(query);

  const paths = posts
    .filter(post => typeof post.slug === 'string')
    .map(post => ({
      params: { slug: String(post.slug) }, // 🔒 force slug to string
    }));

  return {
    paths,
    fallback: true,
  };
}
