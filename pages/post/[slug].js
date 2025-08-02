import { sanityClient } from '../../lib/sanity';
import Head from 'next/head';
import Image from 'next/image';

export default function Post({ post }) {
  if (!post) return <p>Post not found.</p>;

  return (
    <>
      <Head>
        <title>{post.seoTitle || post.title} | DIY HQ</title>
        <meta name="description" content={post.seoDescription || post.excerpt || ''} />
      </Head>
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        {post.mainImage?.asset?._ref && (
          <img
            src={post.mainImageUrl}
            alt={post.imageAlt || 'Blog image'}
            className="w-full rounded-lg mb-4"
          />
        )}

        {post.publishedAt && (
          <p className="text-sm text-gray-600 mb-2">{new Date(post.publishedAt).toLocaleDateString()}</p>
        )}

        {post.difficultyLevel && (
          <p className="mb-2"><strong>Difficulty:</strong> {post.difficultyLevel}</p>
        )}

        {post.estimatedTime && (
          <p className="mb-2"><strong>Estimated Time:</strong> {post.estimatedTime}</p>
        )}

        {post.estimatedCost && (
          <p className="mb-2"><strong>Estimated Cost:</strong> {post.estimatedCost}</p>
        )}

        {post.readTime && (
          <p className="mb-2"><strong>Read Time:</strong> {post.readTime} minutes</p>
        )}

        {post.authorAIName && (
          <p className="mb-2"><strong>Author:</strong> {post.authorAIName}</p>
        )}

        {post.toolsNeeded?.length > 0 && (
          <div className="mb-4">
            <strong>Tools Needed:</strong>
            <ul className="list-disc list-inside">
              {post.toolsNeeded.map((tool, i) => <li key={i}>{tool}</li>)}
            </ul>
          </div>
        )}

        {post.materialsNeeded?.length > 0 && (
          <div className="mb-4">
            <strong>Materials Needed:</strong>
            <ul className="list-disc list-inside">
              {post.materialsNeeded.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        {post.stepByStepInstructions?.length > 0 && (
          <div className="mb-4">
            <strong>Instructions:</strong>
            <ol className="list-decimal list-inside">
              {post.stepByStepInstructions.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        )}

        {post.safetyTips?.length > 0 && (
          <div className="mb-4">
            <strong>Safety Tips:</strong>
            <ul className="list-disc list-inside">
              {post.safetyTips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        )}

        {post.commonMistakes?.length > 0 && (
          <div className="mb-4">
            <strong>Common Mistakes:</strong>
            <ul className="list-disc list-inside">
              {post.commonMistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
            </ul>
          </div>
        )}

        {post.projectTags?.length > 0 && (
          <div className="mb-4">
            <strong>Tags:</strong> {post.projectTags.join(', ')}
          </div>
        )}

        {post.faq?.length > 0 && (
          <div className="mb-4">
            <strong>FAQ:</strong>
            <ul className="list-disc list-inside">
              {post.faq.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        )}

        {post.affiliateLinks?.length > 0 && (
          <div className="mb-4">
            <strong>Affiliate Links:</strong>
            <ul className="list-disc list-inside">
              {post.affiliateLinks.map((link, i) => (
                <li key={i}><a href={link} className="text-blue-500 underline" target="_blank">{link}</a></li>
              ))}
            </ul>
          </div>
        )}

        {post.videoURL && (
          <div className="mb-4">
            <strong>Video:</strong>
            <div className="aspect-w-16 aspect-h-9">
              <iframe src={post.videoURL} title="Video" frameBorder="0" allowFullScreen className="w-full h-64"></iframe>
            </div>
          </div>
        )}

        {/* Raw Body (Block Content) */}
        {post.body && (
          <div className="mt-4 prose max-w-none">
            {/* TODO: Hook up PortableText rendering if needed */}
            <p>{post.body}</p>
          </div>
        )}
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const query = `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map(post => ({ params: { slug: post.slug } }));

  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  const query = `*[_type == "post" && slug.current == $slug][0]`;
  const post = await sanityClient.fetch(query, { slug: params.slug });

  if (!post) return { notFound: true };

  const mainImageUrl = post.mainImage?.asset?._ref
    ? `https://cdn.sanity.io/images/plkjpsnw/production/${post.mainImage.asset._ref.split('-')[1]}.jpg`
    : null;

  return {
    props: {
      post: {
        ...post,
        mainImageUrl,
      },
    },
    revalidate: 60,
  };
}
