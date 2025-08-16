// pages/post/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PortableText } from '@portabletext/react';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../lib/urlFor';
import ptComponents from '../../components/ptComponents';
import AdSlot from '../../components/AdSlot'; // ← add this import

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
    body = [],
    stepByStepInstructions = [],
    safetyTips = [],
    commonMistakes = [],
  } = post;

  const asArray = (v) => (Array.isArray(v) ? v : []);
  const bodyBlocks = Array.isArray(body) ? body : [];
  const mainUrl = mainImage ? urlFor(mainImage).width(1200).fit('max').url() : null;

  return (
    <>
      <Head>
        <title>{title} | DIY HQ</title>
        <meta name="description" content={seoDescription || title} />
        {mainUrl && <meta property="og:image" content={mainUrl} />}
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

        {/* Meta row under image (you already added this previously) */}
        <div className="text-xs text-gray-500 mb-2">
          {imageAlt && <span>Alt: {imageAlt}</span>}
          {publishedAt && <span className="ml-2">• {new Date(publishedAt).toLocaleDateString()}</span>}
          {/* Add skill level, time, cost here if present */}
        </div>

        {/* Social share bar goes here (already added) */}

        {/* --- AD #1: Display ad directly under hero image --- */}
        {/* Replace the SLOT IDs with *your* numeric ad-slot from AdSense */}
        <div className="my-4">
          <AdSlot
            slot="REPLACE_WITH_YOUR_TOP_DISPLAY_SLOT_ID"
            format="auto"
            style={{ display: 'block', width: '100%', minHeight: 90 }}
          />
        </div>

        {/* Article body */}
        <article className="prose max-w-none">
          <PortableText value={bodyBlocks} components={ptComponents} />
        </article>

        {/* --- AD #2: In-article ad after the first section (fluid) --- */}
        <div className="my-8">
          <AdSlot
            slot="REPLACE_WITH_YOUR_INARTICLE_SLOT_ID"
            format="fluid"
            style={{ display: 'block', textAlign: 'center', minHeight: 200 }}
            // layoutKey="REPLACE_IF_ADSENSE_GAVE_YOU_ONE"
          />
        </div>

        {/* Arrays */}
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
    _id, title, slug, publishedAt, mainImage, imageAlt, authorAIName, seoDescription,
    "body": coalesce(body, []),
    "stepByStepInstructions": coalesce(stepByStepInstructions, []),
    "safetyTips": coalesce(safetyTips, []),
    "commonMistakes": coalesce(commonMistakes, [])
  }`;
  const post = await sanityClient.fetch(query, { slug: params.slug });
  if (!post) return { notFound: true };
  return { props: { post }, revalidate: 60 };
}

export async function getStaticPaths() {
  const slugs = await sanityClient.fetch(`*[_type == "post" && defined(slug.current)][].slug.current`);
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: 'blocking' };
}
