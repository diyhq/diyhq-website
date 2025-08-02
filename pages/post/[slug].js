// pages/post/[slug].js
import { groq } from 'next-sanity';
import { getClient } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';
import Head from 'next/head';

export async function getStaticPaths() {
  const query = groq`*[_type == "post" && defined(slug.current)][].slug.current`;
  const slugs = await getClient().fetch(query);
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const query = groq`*[_type == "post" && slug.current == $slug][0]`;
  const post = await getClient().fetch(query, { slug: params.slug });
  return { props: { post }, revalidate: 60 };
}

export default function PostPage({ post }) {
  if (!post) return <div>Loading…</div>;

  const {
    title,
    mainImage,
    imageAlt,
    publishedAt,
    body,
    category,
    difficultyLevel,
    toolsNeeded,
    materialsNeeded,
    stepByStepInstructions,
    safetyTips,
    commonMistakes,
    estimatedTime,
    estimatedCost,
    seoTitle,
    seoDescription,
    projectTags,
    authorAIName,
    commentsEnabled,
    updateLog,
    readTime,
    featured,
    videoURL,
    faq,
    affiliateLinks,
    internalLink,
    externalSourceURL,
    isTestPost,
    pinnedCategorySortOrder,
    schemaTypeVersion,
  } = post;

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Head>
        <title>{seoTitle || title}</title>
        <meta name="description" content={seoDescription || ''} />
      </Head>

      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      {mainImage?.asset?._ref && (
        <img
          src={mainImage.asset.url || `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${mainImage.asset._ref.split('-')[1]}-${mainImage.asset._ref.split('-')[2]}.${mainImage.asset._ref.split('-')[3]}`}
          alt={imageAlt || 'DIY HQ Blog Image'}
          className="mb-6 rounded"
        />
      )}

      <p className="text-sm text-gray-500 mb-4">{new Date(publishedAt).toLocaleDateString()}</p>

      {difficultyLevel && <p><strong>Difficulty:</strong> {difficultyLevel}</p>}
      {estimatedTime && <p><strong>Estimated Time:</strong> {estimatedTime}</p>}
      {estimatedCost && <p><strong>Estimated Cost:</strong> {estimatedCost}</p>}
      {readTime && <p><strong>Read Time:</strong> {readTime} mins</p>}
      {authorAIName && <p><strong>Author:</strong> {authorAIName}</p>}
      {videoURL && <p><strong>Video:</strong> <a href={videoURL} className="text-blue-600 underline">Watch</a></p>}
      {externalSourceURL && <p><strong>Source:</strong> <a href={externalSourceURL} className="text-blue-600 underline">Visit</a></p>}
      {internalLink && <p><strong>Related Internal Link:</strong> <a href={internalLink} className="text-blue-600 underline">Go</a></p>}

      {toolsNeeded?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-6">Tools Needed:</h3>
          <ul className="list-disc list-inside">
            {toolsNeeded.map((tool, idx) => <li key={idx}>{tool}</li>)}
          </ul>
        </div>
      )}

      {materialsNeeded?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4">Materials Needed:</h3>
          <ul className="list-disc list-inside">
            {materialsNeeded.map((mat, idx) => <li key={idx}>{mat}</li>)}
          </ul>
        </div>
      )}

      {stepByStepInstructions?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4">Steps:</h3>
          <ol className="list-decimal list-inside">
            {stepByStepInstructions.map((step, idx) => <li key={idx}>{step}</li>)}
          </ol>
        </div>
      )}

      {safetyTips?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4">Safety Tips:</h3>
          <ul className="list-disc list-inside">
            {safetyTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
          </ul>
        </div>
      )}

      {commonMistakes?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4">Common Mistakes:</h3>
          <ul className="list-disc list-inside">
            {commonMistakes.map((mistake, idx) => <li key={idx}>{mistake}</li>)}
          </ul>
        </div>
      )}

      {faq?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4">FAQ:</h3>
          <ul className="list-disc list-inside">
            {faq.map((q, idx) => <li key={idx}>{q}</li>)}
          </ul>
        </div>
      )}

      {affiliateLinks?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4">Affiliate Links:</h3>
          <ul className="list-disc list-inside">
            {affiliateLinks.map((link, idx) => <li key={idx}><a href={link} className="text-blue-600 underline">{link}</a></li>)}
          </ul>
        </div>
      )}

      {projectTags?.length > 0 && (
        <p className="mt-4"><strong>Tags:</strong> {projectTags.join(', ')}</p>
      )}

      {updateLog?.length > 0 && (
        <div className="mt-6 text-sm text-gray-600">
          <strong>Update Log:</strong>
          <ul className="list-disc list-inside">
            {updateLog.map((log, idx) => <li key={idx}>{log}</li>)}
          </ul>
        </div>
      )}

      {body && (
        <div className="prose prose-blue mt-8">
          <PortableText value={body} />
        </div>
      )}
    </article>
  );
}
