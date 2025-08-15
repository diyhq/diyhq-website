// pages/post/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PortableText } from '@portabletext/react';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../lib/urlFor';
import ptComponents from '../../components/ptComponents';
import SocialShareBar from '../../components/SocialShareBar';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.doityourselfhq.com';

export default function Post({ post }) {
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
    estimatedTime,
    estimatedCost,
    difficultyLevel,
    // coalesced in the query
    body = [],
    stepByStepInstructions = [],
    safetyTips = [],
    commonMistakes = [],
    slug,
  } = post;

  const asArray = (v) => (Array.isArray(v) ? v : []);
  const bodyBlocks = Array.isArray(body) ? body : [];

  const mainUrl = mainImage ? urlFor(mainImage).width(1200).fit('max').url() : '';
  const shareUrl = `${SITE_URL}/post/${slug?.current ?? ''}`;

  // Build the tiny metadata row under the image
  const metaBits = [
    imageAlt && `Image: ${imageAlt}`,
    estimatedTime && `Build time: ${estimatedTime}`,
    difficultyLevel && `Skill: ${difficultyLevel}`,
    estimatedCost && `Cost: ${estimatedCost}`,
  ].filter(Boolean);

  return (
    <>
      <Head>
        <title>{title} | DIY HQ</title>
        <meta name="description" content={seoDescription || title} />
        {mainUrl && <meta property="og:image" content={mainUrl} />}
        <meta property="og:title" content={title} />
        {shareUrl && <meta property="og:url" content={shareUrl} />}
        {seoDescription && <meta property="og:description" content={seoDescription} />}
      </Head>

      <main className="max-w-3xl mx-auto p-4">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">{title}</h1>

        {/* Featured image */}
        {mainUrl && (
          <img
            src={mainUrl}
            alt={imageAlt || title}
            className="w-full rounded-lg"
            loading="lazy"
          />
        )}

        {/* Small meta line under the photo */}
        {metaBits.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            {metaBits.map((bit, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">·</span>}
                {bit}
              </span>
            ))}
          </div>
        )}

        {/* Date + Author (kept as-is) */}
        <div className="text-sm text-gray-500 mt-2">
          {publishedAt ? new Date(publishedAt).toLocaleDateString() : null}
          {authorAIName && (
            <>
              {' '}
              <span className="mx-1">·</span> Written by {authorAIName}
            </>
          )}
        </div>

        {/* Share bar directly under the image/meta, above the article body */}
        <SocialShareBar
          url={shareUrl}
          title={title}
          description={seoDescription || ''}
          image={mainUrl}
        />

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

    // Prefer top-level fields; fall back to meta.* if that's how older posts saved them
    "estimatedTime":  coalesce(estimatedTime,  meta.estimatedTime),
    "estimatedCost":  coalesce(estimatedCost,  meta.estimatedCost),
    "difficultyLevel": coalesce(difficultyLevel, meta.difficultyLevel),

    // Make sure null becomes [] so build never crashes
    "body": coalesce(body, []),
    "stepByStepInstructions": coalesce(stepByStepInstructions, []),
    "safetyTips": coalesce(safetyTips, []),
    "commonMistakes": coalesce(commonMistakes, [])
  }`;

  const post = await sanityClient.fetch(query, { slug: params.slug });
  if (!post) return { notFound: true };

  return {
    props: { post },
    revalidate: 60, // ISR
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
