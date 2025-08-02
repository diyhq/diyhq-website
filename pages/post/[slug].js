import { useRouter } from 'next/router';
import Head from 'next/head';
import { sanityClient, urlFor } from '../../lib/sanity'; // ✅ FIXED: relative import
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

        {post.difficultyLevel && (
          <p className="mb-2">
            <strong>Difficulty:</strong> {post.difficultyLevel}
          </p>
        )}

        {post.toolsNeeded?.length > 0 && (
          <div className="mb-2">
            <strong>Tools Needed:</strong>
            <ul className="list-disc list-inside ml-4">
              {post.toolsNeeded.map((tool, index) => (
                <li key={index}>{tool}</li>
              ))}
            </ul>
          </div>
        )}

        {post.materialsNeeded?.length > 0 && (
          <div className="mb-2">
            <strong>Materials Needed:</strong>
            <ul className="list-disc list-inside ml-4">
              {post.materialsNeeded.map((mat, index) => (
                <li key={index}>{mat}</li>
              ))}
            </ul>
          </div>
        )}

        {post.stepByStepInstructions?.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Step-by-Step Instructions</h2>
            <ol className="list-decimal list-inside ml-4">
              {post.stepByStepInstructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {post.safetyTips?.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Safety Tips</h2>
            <ul className="list-disc list-inside ml-4">
              {post.safetyTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {post.commonMistakes?.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Common Mistakes</h2>
            <ul className="list-disc list-inside ml-4">
              {post.commonMistakes.map((mistake, index) => (
                <li key={index}>{mistake}</li>
              ))}
            </ul>
          </div>
        )}

        {post.projectTags?.length > 0 && (
          <div className="mb-4">
            <strong>Project Tags:</strong>{' '}
            {post.projectTags.map((tag, index) => (
              <span key={index} className="inline-block bg-gray-200 px-2 py-1 text-xs rounded mr-2">
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.readTime && (
          <p className="mb-2">
            <strong>Estimated Read Time:</strong> {post.readTime} minutes
          </p>
        )}

        {post.estimatedTime && (
          <p className="mb-2">
            <strong>Estimated Project Time:</strong> {post.estimatedTime}
          </p>
        )}

        {post.estimatedCost && (
          <p className="mb-2">
            <strong>Estimated Cost:</strong> {post.estimatedCost}
          </p>
        )}

        <article className="prose mt-6">
          <PortableText value={post.body} />
        </article>
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
    category->{title},
    authorAIName,
    seoDescription,
    difficultyLevel,
    toolsNeeded,
    materialsNeeded,
    stepByStepInstructions,
    safetyTips,
    commonMistakes,
    projectTags,
    readTime,
    estimatedTime,
    estimatedCost
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
  const query = `*[_type == "post" && defined(slug.current)][] {
    "slug": slug.current
  }`;

  const posts = await sanityClient.fetch(query);

  const paths = posts
    .filter(post => typeof post.slug === 'string')
    .map(post => ({
      params: { slug: post.slug },
    }));

  return {
    paths,
    fallback: true,
  };
}
