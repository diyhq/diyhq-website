// pages/post/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PortableText } from '@portabletext/react';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../lib/urlFor';
import ptComponents from '../../components/ptComponents';
import SocialShareBar from '../../components/SocialShareBar';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.doityourselfhq.com';

export default function Post({ post }) {
  const router = useRouter();
  if (router.isFallback) return <p>Loading…</p>;
  if (!post) return <p>Post not found.</p>;

  const {
    title,
    seoDescription,
    slug,
    publishedAt,
    mainImage,
    imageAlt,
    authorAIName,
    estimatedTime,
    estimatedCost,
    skillLevel,
    body = [],
    stepByStepInstructions = [],
    safetyTips = [],
    commonMistakes = [],
  } = post;

  const mainUrl = mainImage ? urlFor(mainImage).width(1200).fit('max').url() : '';
  const shareUrl = `${SITE_URL}/post/${slug?.current}`;

  const asArray = (v) => (Array.isArray(v) ? v : []);

  return (
    <>
      <Head>
        <title>{title} | DIY HQ</title>
        <meta name="description" content={seoDescription || title} />
        {mainUrl && <meta property="og:image" content={mainUrl} />}
        <meta property="og:url" content={shareUrl} />
      </Head>

      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-3">{title}</h1>

        {mainUrl && (
          <img
            src={mainUrl}
            alt={imageAlt || title}
            className="w-full rounded-lg mb-2"
            loading="lazy"
          />
        )}

        {/* Small meta line under image */}
        <p className="text-xs text-gray-500 mb-2">
          {imageAlt && <span>Alt: {imageAlt}</span>}
          {skillLevel && <span className="mx-1">• Skill: {skillLevel}</span>}
          {estimatedTime && <span className="mx-1">• Time: {estimatedTime}</span>}
          {estimatedCost && <span className="mx-1">• Cost: {estimatedCost}</span>}
          {authorAIName && <span className="mx-1 italic">• By {authorAIName}</span>}
          {publishedAt && (
            <span className="mx-1">
              • {new Date(publishedAt).toLocaleDateString()}
            </span>
          )}
        </p>

        {/* Share bar (between image + body) */}
        <SocialShareBar url={shareUrl} title={title} imageUrl={mainUrl} />

        {/* Body */}
        <article className="prose max-w-none">
          <PortableText value={asArray(body)} components={ptComponents} />
        </article>

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
    // keep names that exist in your schema
    "estimatedTime":  coalesce(estimatedTime, ""),
    "estimatedCost":  coalesce(estimatedCost, ""),
    "skillLevel":     coalesce(skillLevel, difficulty, ""), // falls back if you use "difficulty"
    "body":               coalesce(body, []),
    "stepByStepInstructions": coalesce(stepByStepInstructions, []),
    "safetyTips":            coalesce(safetyTips, []),
    "commonMistakes":        coalesce(commonMistakes, [])
  }`;

  const post = await sanityClient.fetch(query, { slug: params.slug });
  if (!post) return { notFound: true };

  return { props: { post }, revalidate: 60 };
}

export async function getStaticPaths() {
  const slugs = await sanityClient.fetch(
    `*[_type == "post" && defined(slug.current)][].slug.current`
  );
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: 'blocking' };
}
