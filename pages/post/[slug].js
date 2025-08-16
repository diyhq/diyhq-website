// pages/post/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../lib/urlFor';
import RichContent from '../../components/RichContent';
import ptComponents from '../../components/ptComponents';
import SocialShareBar from '../../components/SocialShareBar';

export default function Post({ post, canonicalUrl }) {
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
    skillLevel,
    body = [],
    stepByStepInstructions = [],
    safetyTips = [],
    commonMistakes = [],
    slug,
  } = post;

  const mainUrl = mainImage ? urlFor(mainImage).width(1200).fit('max').url() : null;

  return (
    <>
      <Head>
        <title>{title} | DIY HQ</title>
        <meta name="description" content={seoDescription || title} />
        {mainUrl && <meta property="og:image" content={mainUrl} />}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
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

        {/* Share bar directly under image */}
        <div className="mb-3">
          <SocialShareBar
            url={canonicalUrl || ''}
            title={title}
          />
        </div>

        {/* Small meta line under the image, like magazines */}
        <div className="text-xs text-gray-500 mb-6 space-x-2">
          {imageAlt && <span>Alt: {imageAlt}</span>}
          {skillLevel && <span>• Skill: {skillLevel}</span>}
          {estimatedTime && <span>• Time: {estimatedTime}</span>}
          {estimatedCost && <span>• Cost: {estimatedCost}</span>}
          {publishedAt && <span>• {new Date(publishedAt).toLocaleDateString()}</span>}
          {authorAIName && <span>• by {authorAIName}</span>}
        </div>

        {/* Body (auto PT or Markdown) */}
        <article className="prose max-w-none">
          <RichContent value={Array.isArray(body) && body.length ? body : body} />
        </article>

        {/* Arrays (always safe) */}
        {Array.isArray(stepByStepInstructions) && stepByStepInstructions.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-2">Step‑by‑Step Instructions</h2>
            <ol className="list-decimal pl-6 space-y-1">
              {stepByStepInstructions.map((step, idx) => (
                <li key={idx}>{String(step)}</li>
              ))}
            </ol>
          </section>
        )}

        {Array.isArray(safetyTips) && safetyTips.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-2">Safety Tips</h2>
            <ul className="list-disc pl-6 space-y-1">
              {safetyTips.map((tip, idx) => (
                <li key={idx}>{String(tip)}</li>
              ))}
            </ul>
          </section>
        )}

        {Array.isArray(commonMistakes) && commonMistakes.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-2">Common Mistakes</h2>
            <ul className="list-disc pl-6 space-y-1">
              {commonMistakes.map((m, idx) => (
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
    estimatedTime,
    estimatedCost,
    skillLevel,
    // Keep `body` as-is: PT array or string; don't coerce away
    body,
    // Arrays: coalesce so the page never crashes
    "stepByStepInstructions": coalesce(stepByStepInstructions, []),
    "safetyTips": coalesce(safetyTips, []),
    "commonMistakes": coalesce(commonMistakes, [])
  }`;

  const post = await sanityClient.fetch(query, { slug: params.slug });
  if (!post) return { notFound: true };

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.doityourselfhq.com';
  const canonicalUrl = `${base}/post/${post.slug?.current || params.slug}`;

  return {
    props: { post, canonicalUrl },
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
