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
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
        </div>

        <article className="prose">
          <PortableText value={post.body} />
        </article>

        <div className="mt-8 space-y-2 text-sm text-gray-700">
          {post.difficultyLevel && <p><strong>Difficulty:</strong> {post.difficultyLevel}</p>}
          {post.estimatedTime && <p><strong>Time Required:</strong> {post.estimatedTime}</p>}
          {post.estimatedCost && <p><strong>Estimated Cost:</strong> {post.estimatedCost}</p>}
        </div>

        {post.toolsNeeded?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold">Tools Needed</h2>
            <ul className="list-disc list-inside">
              {post.toolsNeeded.map((tool, idx) => <li key={idx}>{tool}</li>)}
            </ul>
          </div>
        )}

        {post.materialsNeeded?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold">Materials Needed</h2>
            <ul className="list-disc list-inside">
              {post.materialsNeeded.map((mat, idx) => <li key={idx}>{mat}</li>)}
            </ul>
          </div>
        )}

        {post.safetyTips?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold">Safety Tips</h2>
            <ul className="list-disc list-inside">
              {post.safetyTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          </div>
        )}

        {post.commonMistakes?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold">Common Mistakes</h2>
            <ul className="list-disc list-inside">
              {post.commonMistakes.map((m, idx) => <li key={idx}>{m}</li>)}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;

  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    body,
    mainImage,
    imageAlt,
    publishedAt,
    authorAIName,
    seoDescription,
    excerpt,
    difficultyLevel,
    estimatedTime,
    estimatedCost,
    toolsNeeded,
    materialsNeeded,
    safetyTips,
    commonMistakes
  }`;

  const post = await sanityClient.fetch(query, { slug });

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
  const query = `*[_type == "post" && defined(slug.current)][]{
    "slug": slug.current
  }`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map(post => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: true,
  };
}
