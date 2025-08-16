// pages/post/[slug].js
import Head from "next/head";
import { useRouter } from "next/router";
import { PortableText } from "@portabletext/react";
import { sanityClient } from "../../lib/sanity";
import { urlFor } from "../../lib/urlFor";
import ptComponents from "../../components/ptComponents";
import SocialShareBar from "../../components/SocialShareBar";
import AdSlot from "../../components/AdSlot";

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
    // coalesced to arrays by the query, but we still guard at runtime
    body = [],
    stepByStepInstructions = [],
    safetyTips = [],
    commonMistakes = [],
    estimatedTime,
    estimatedCost,
    skillLevel,
    slug,
  } = post;

  const asArray = (v) => (Array.isArray(v) ? v : []);
  const bodyBlocks = Array.isArray(body) ? body : [];

  const mainUrl = mainImage ? urlFor(mainImage).width(1200).fit("max").url() : null;

  // tiny meta line contents
  const metaBits = [
    imageAlt ? `Alt: ${imageAlt}` : null,
    skillLevel ? `Skill: ${skillLevel}` : null,
    publishedAt ? `Date: ${new Date(publishedAt).toLocaleDateString()}` : null,
    estimatedTime ? `Time: ${estimatedTime}` : null,
    estimatedCost ? `Cost: ${estimatedCost}` : null,
  ].filter(Boolean);

  return (
    <>
      <Head>
        <title>{title} | DIY HQ</title>
        <meta name="description" content={seoDescription || title} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {mainUrl && <meta property="og:image" content={mainUrl} />}
      </Head>

      {/* Two‑column layout on large screens (article + right‑rail) */}
      <main className="max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-12 lg:gap-8">
        <article className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>

          {mainUrl && (
            <img
              src={mainUrl}
              alt={imageAlt || title}
              className="w-full rounded-lg mb-2"
              loading="lazy"
            />
          )}

          {/* Tiny meta line under image */}
          {metaBits.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {metaBits.join(" • ")}
            </div>
          )}

          {/* Author line, then share bar */}
          {authorAIName && (
            <p className="text-sm italic text-gray-600 mb-2">Written by {authorAIName}</p>
          )}

          {/* Color share buttons just below the image/author/meta area */}
          <SocialShareBar url={canonicalUrl} title={title} media={mainUrl} className="mb-6" />

          {/* Body */}
          <article className="prose max-w-none">
            <PortableText value={bodyBlocks} components={ptComponents} />
          </article>

          {/* Utility sections (always render as arrays) */}
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
        </article>

        {/* Right‑rail (hidden on small screens) */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            {/* Sidebar ad #1 */}
            <AdSlot className="w-full" />

            {/* You can stack more ad units or a “Tools & Materials” card here */}
            {/* <AdSlot className="w-full" /> */}
          </div>
        </aside>
      </main>
    </>
  );
}

export async function getStaticProps({ params }) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.doityourselfhq.com";

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
    // Make sure null becomes [] so build never crashes
    "body": coalesce(body, []),
    "stepByStepInstructions": coalesce(stepByStepInstructions, []),
    "safetyTips": coalesce(safetyTips, []),
    "commonMistakes": coalesce(commonMistakes, [])
  }`;

  const post = await sanityClient.fetch(query, { slug: params.slug });
  if (!post) return { notFound: true };

  const canonicalUrl = `${siteUrl}/post/${post.slug.current}`;

  return {
    props: { post, canonicalUrl },
    revalidate: 60, // ISR
  };
}

export async function getStaticPaths() {
  // prebuild the slugs we know; others build on first request
  const slugs = await sanityClient.fetch(
    `*[_type == "post" && defined(slug.current)][].slug.current`
  );

  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
}
