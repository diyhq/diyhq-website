// pages/post/[slug].js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { sanityFetch, USE_CATEGORY_REFERENCE } from "../../lib/sanityFetch";
import { urlFor } from "../../lib/sanity";
import RichContent from "../../components/RichContent";

// Build the post query as a plain JS template string (no backticks inside the GROQ itself)
const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  ${USE_CATEGORY_REFERENCE ? `"category": category->slug.current, "categoryTitle": category->title,` : `"category": category, "categoryTitle": category,`}
  publishedAt,
  mainImage,
  imageUrl,
  excerpt,
  readingTime,
  estimatedTime,
  estimatedCost,
  skillLevel,
  body,
  "stepByStepInstructions": coalesce(stepByStepInstructions, [])
}
`;

const PATHS_QUERY = `
*[_type == "post" && defined(slug.current)][].slug.current
`;

export default function PostPage({ post }) {
  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <p className="mt-2">
          <Link className="text-orange-600 underline" href="/">Go back home</Link>
        </p>
      </main>
    );
  }

  const {
    title,
    slug,
    category,
    categoryTitle,
    publishedAt,
    excerpt,
    mainImage,
    imageUrl,
    readingTime,
    estimatedTime,
    estimatedCost,
    skillLevel,
    body,
    stepByStepInstructions,
  } = post;

  const cover =
    imageUrl ||
    (mainImage ? urlFor(mainImage).width(1200).height(630).fit("crop").url() : null);

  const prettyDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Head>
        <title>{title ? `${title} – DIY HQ` : "Post – DIY HQ"}</title>
        {excerpt ? <meta name="description" content={excerpt} /> : null}
        {slug ? <link rel="canonical" href={`https://doityourselfhq.com/post/${slug}`} /> : null}
        {cover ? <meta property="og:image" content={cover} /> : null}
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb / Category */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          {category ? (
            <Link
              href={`/category/${category}`}
              className="hover:underline"
            >
              {categoryTitle || category}
            </Link>
          ) : (
            <span>Post</span>
          )}
        </nav>

        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>

        {/* Meta */}
        <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
          {prettyDate ? <span>Published {prettyDate}</span> : null}
          {typeof readingTime === "number" ? <span>~{readingTime} min read</span> : null}
          {estimatedTime ? <span>Time: {estimatedTime}</span> : null}
          {estimatedCost ? <span>Cost: {estimatedCost}</span> : null}
          {skillLevel ? <span>Skill: {skillLevel}</span> : null}
        </div>

        {/* Cover Image */}
        {cover ? (
          <div className="mt-6">
            <Image
              src={cover}
              alt={title || "Cover image"}
              width={1200}
              height={630}
              className="w-full h-auto rounded-md object-cover"
              priority
            />
          </div>
        ) : null}

        {/* Excerpt */}
        {excerpt ? (
          <p className="mt-6 text-lg text-gray-800">{excerpt}</p>
        ) : null}

        {/* Body (Portable Text) */}
        <article className="prose prose-lg max-w-none mt-8">
          {Array.isArray(body) ? (
            <RichContent value={body} />
          ) : typeof body === "string" ? (
            <div dangerouslySetInnerHTML={{ __html: body }} />
          ) : null}
        </article>

        {/* Optional: Step-by-step instructions (if you want to render them simply) */}
        {Array.isArray(stepByStepInstructions) && stepByStepInstructions.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Step-by-Step</h2>
            <ol className="list-decimal ml-6 space-y-2">
              {stepByStepInstructions.map((step, idx) => (
                <li key={idx}>
                  {typeof step === "string" ? step : JSON.stringify(step)}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </main>
    </>
  );
}

export async function getStaticPaths() {
  try {
    const slugs = await sanityFetch(PATHS_QUERY);
    const paths = Array.isArray(slugs)
      ? slugs
          .filter(Boolean)
          .map((s) => ({ params: { slug: String(s) } }))
      : [];

    return { paths, fallback: "blocking" };
  } catch (e) {
    // If query fails, let Next.js handle on-demand via blocking fallback
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  const slug = params?.slug || null;

  if (!slug) {
    return { notFound: true };
  }

  try {
    const post = await sanityFetch(POST_QUERY, { slug });

    if (!post) {
      return { notFound: true, revalidate: 60 };
    }

    return {
      props: { post },
      revalidate: 60, // ISR: refresh every minute
    };
  } catch (e) {
    // On error, return 404 to avoid breaking the build
    return { notFound: true, revalidate: 60 };
  }
}
