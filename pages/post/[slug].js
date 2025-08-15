import Head from 'next/head';
import { useRouter } from 'next/router';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../lib/urlFor';
import { PortableText } from '@portabletext/react';
import ptComponents from '../../components/ptComponents';

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
    body,
    pst, // legacy field from earlier bad patch (may or may not exist)
    stepByStepInstructions,
    safetyTips,
    commonMistakes,
  } = post;

  // ---- Normalizers (avoid `.length` on null) ----
  const portableBody = Array.isArray(body)
    ? body
    : Array.isArray(pst?.body)     // fallback for older docs that stored content under `pst.body`
    ? pst.body
    : [];

  const steps = Array.isArray(stepByStepInstructions) ? stepByStepInstructions : [];
  const safety = Array.isArray(safetyTips) ? safetyTips : [];
  const mistakes = Array.isArray(commonMistakes) ? commonMistakes : [];

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
            className="w-full rounded-lg mb-4"
          />
        )}

        <div className="text-sm text-gray-500 mb-2">
          {publishedAt ? new Date(publishedAt).toLocaleDateString() : null}
        </div>

        {authorAIName && (
          <p className="text-sm italic text-gray-600 mb-4">
            Written by {authorAIName}
          </p>
        )}

        {/* Portable Text (Sanity rich content) */}
        <article className="prose max-w-none">
          <PortableText value={portableBody} components={ptComponents} />
        </article>

        {/* Arrays are strings in your schema – render as lists */}
        {steps.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Step‑by‑Step Instructions</h2>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              {steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {safety.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Safety Tips</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {safety.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </section>
        )}

        {mistakes.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Common Mistakes</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {mistakes.map((m, idx) => (
                <li key={idx}>{m}</li>
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
    // Rich content
    body,
    // Include legacy 'pst' so we can fall back to pst.body if needed
    pst,
    // Arrays of strings
    stepByStepInstructions,
    safetyTips,
    commonMistakes
  }`;

  const post = await sanityClient.fetch(query, { slug: params.slug });

  if (!post) return { notFound: true };

  return {
    props: { post },
    revalidate: 60, // ISR
  };
}

export async function getStaticPaths() {
  // Prebuild current slugs; others are rendered on first hit
  const slugs = await sanityClient.fetch(
    `*[_type == "post" && defined(slug.current)][].slug.current`
  );
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  };
}
