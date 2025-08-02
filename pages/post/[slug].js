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
        <meta name="description" content={post.seoDescription || post.title} />
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

        {post.authorAIName && (
          <p className="text-sm italic text-gray-600 mb-4">
            Written by {post.authorAIName}
          </p>
        )}

        <article className="prose">
          <PortableText value={post.body} />
        </article>

        {post.stepByStepInstructions?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Step-by-Step Instructions</h2>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              {post.stepByStepInstructions.map((step, idx) => (
                <li key={step._key || idx}>{step.text}</li>
              ))}
            </ol>
          </div>
        )}

        {post.safetyTips?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Safety Tips</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {post.safetyTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {post.commonMistakes?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Common Mistakes</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {post.commonMistakes.map((mistake, idx) => (
                <li key={idx}>{mistake}</li>
              ))}
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
    stepByStepInstructions,
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
  return {
    paths: [
      {
        params: { slug: 'this-is-a-blog-test-for-home-repair' },
      },
    ],
    fallback: true,
  };
}
