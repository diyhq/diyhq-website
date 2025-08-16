// pages/post/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PortableText } from '@portabletext/react';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../lib/urlFor';
import ptComponents from '../../components/ptComponents';
import SocialShareBar from '../../components/SocialShareBar';

export default function Post({ post, siteUrl }) {
  const router = useRouter();
  if (router.isFallback) return <p>Loading…</p>;
  if (!post) return <p>Post not found.</p>;

  const {
    title,
    seoDescription,
    publishedAt,
    mainImage,
    imageAlt,
    authorAIName,
    // meta bits (optional in schema; guarded below)
    difficultyLevel,
    estimatedTime,
    estimatedCost,
    // arrays (already coalesced in the query)
    body = [],
    stepByStepInstructions = [],
    safetyTips = [],
    commonMistakes = [],
    slug,
  } = post;

  const asArray = (v) => (Array.isArray(v) ? v : []);
  const bodyBlocks = Array.isArray(body) ? body : [];

  const mainUrl = mainImage ? urlFor(mainImage).width(1200).fit('max').url() : null;

  // Site URL from env, with safe fallback
  const base =
    siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.doityourselfhq.com';
  const shareUrl = `${base}/post/${slug?.current || ''}`;

  // Build the tiny meta row
  const metaParts = []
    .concat(imageAlt ? [`Alt: ${imageAlt}`] : [])
    .concat(difficultyLevel ? [`Skill: ${difficultyLevel}`] : [])
    .concat(estimatedTime ? [`Time: ${estimatedTime}`] : [])
    .concat(estimatedCost ? [`Cost: ${estimatedCost}`] : []);

  return (
    <>
      <Head>
        <title>{title} | DIY HQ</title>
        <meta name="description" content={seoDescription || title} />
        {mainUrl && <meta property="og:image" content={mainUrl} />}
        <meta property="og:title" content={title} />
        <meta property="og:url" content={shareUrl} />
      </Head>

      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>

        {mainUrl && (
          <img
            src={mainUrl}
            alt={imageAlt || title}
            className="w-full rounded-lg mb-2"
            loading="lazy"
          />
        )}

        {/* tiny meta row, just under the photo */}
        {metaParts.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            {metaParts.join(' • ')}
          </div>
        )}

        {/* share bar, under the photo/meta */}
        <SocialShareBar url={shareUrl} title={title} media={mainUrl} />

        <div className="text-sm text-gray-500 mb-2">
          {publishedAt ? new Date(publishedAt).toLocaleDateString() : null}
        </div>

        {authorAIName && (
          <p className="text-sm italic text-gray-600 mb-4">
            Written by {authorAIName}
          </p>
        )}

        {/* Portable Text (rich content) */}
        <article className="prose max-w-none">
          <PortableText value={bodyBlocks} components={ptComponents} />
        </article>

        {/* Arrays (always treat as arrays) */}
        {asArray(stepByStepInstructions).length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Step‑by‑Step Instructions</h2>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              {asArray(stepByStepInstructions).map((step, idx) => (
                <li key={idx}>{String(step)}</li>
              ))}
            </ol>
          </section>
        )}

        {asArray(safetyTips).length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Safety Tips</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {asArray(safetyTips).map((tip, idx) => (
                <li key={idx}>{String(tip)}</li>
              ))}
            </ul>
          </section>
        )}

        {asArray(commonMistakes).length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Common Mistakes</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {asArray(commonMistakes).map((m, idx) => (
                <li key={idx}>{String(m)}</li>
              ))}
            </ul>
          </section>
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
    publishedAt,
    mainImage,
    imageAlt,
    authorAIName,
    seoDescription,
    difficultyLevel,
    estimatedTime,
    estimatedCost,
    "body": coalesce(body, []),
    "stepByStepInstructions": coalesce(stepByStepInstructions, []),
    "safetyTips": coalesce(safetyTips, []),
    "commonMistakes": coalesce(commonMistakes, [])
  }`;

  const post = await sanityClient.fetch(query, { slug: params.slug });
  if (!post) return { notFound: true };

  return {
    props: {
      post,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const slugs = await sanityClient.fetch(
    `*[_type == "post" && defined(slug.current)][].slug.current`
  );
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  };
}
