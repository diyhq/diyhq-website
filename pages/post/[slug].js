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
    publishedAt,
    mainImage,
    imageAlt,
    authorAIName,
    estimatedTime,
    estimatedCost,
    skillLevel,
    body,
    stepByStepInstructions = [],
    safetyTips = [],
    commonMistakes = [],
    faq = [],
  } = post;

  const mainUrl = mainImage ? urlFor(mainImage).width(1200).fit('max').url() : null;
  const canonical = `${SITE_URL}${router.asPath}`;

  const isBodyArray = Array.isArray(body);
  const arr = (v) => (Array.isArray(v) ? v : []);

  // Soft clean for strings that were pasted with Markdown markers
  const clean = (v) =>
    String(v ?? '')
      // remove **bold** markers
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // remove a single leading dash/bullet if present
      .replace(/^\s*[-•]\s*/, '');

  return (
    <>
      <Head>
        <title>{title} | DIY HQ</title>
        <meta name="description" content={seoDescription || title} />
        {mainUrl && <meta property="og:image" content={mainUrl} />}
        <link rel="canonical" href={canonical} />
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

        {/* meta row under image */}
        <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-x-4 gap-y-1 items-center">
          {imageAlt && <span>Alt: {imageAlt}</span>}
          {publishedAt && <span>{new Date(publishedAt).toLocaleDateString()}</span>}
          {skillLevel && <span>Skill: {skillLevel}</span>}
          {estimatedTime && <span>Time: {estimatedTime}</span>}
          {estimatedCost && <span>Cost: {estimatedCost}</span>}
          {authorAIName && <span>By {authorAIName}</span>}
        </div>

        {/* share bar just under the photo/meta */}
        <SocialShareBar
          title={title}
          url={canonical}
          media={mainUrl || undefined}
          via="DIY_HQ"
        />

        {/* main body */}
        <article className="prose max-w-none mt-4">
          {isBodyArray ? (
            <PortableText value={body} components={ptComponents} />
          ) : (
            <p>{clean(body)}</p>
          )}
        </article>

        {arr(stepByStepInstructions).length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Step‑by‑Step Instructions</h2>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              {arr(stepByStepInstructions).map((step, idx) => (
                <li key={idx}>{clean(step)}</li>
              ))}
            </ol>
          </section>
        )}

        {arr(safetyTips).length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Safety Tips</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {arr(safetyTips).map((tip, idx) => (
                <li key={idx}>{clean(tip)}</li>
              ))}
            </ul>
          </section>
        )}

        {arr(commonMistakes).length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Common Mistakes</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {arr(commonMistakes).map((m, idx) => (
                <li key={idx}>{clean(m)}</li>
              ))}
            </ul>
          </section>
        )}

        {arr(faq).length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <ul className="list-disc list-inside mt-2 space-y-2">
              {arr(faq).map((q, idx) => (
                <li key={idx}>{clean(q)}</li>
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
    body,
    "stepByStepInstructions": coalesce(stepByStepInstructions, []),
    "safetyTips": coalesce(safetyTips, []),
    "commonMistakes": coalesce(commonMistakes, []),
    "faq": coalesce(faq, [])
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
