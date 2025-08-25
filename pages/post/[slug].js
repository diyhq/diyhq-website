// pages/post/[slug].js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";

// ---------- GROQ ----------
const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  seoTitle,
  seoDescription,
  mainImage{
    alt,
    asset->{ _id, url, metadata{ lqip, dimensions{width,height} } }
  },
  "category": coalesce(
    category->{
      _id, title, "slug": slug.current
    },
    select(
      defined(categories) && count(categories) > 0 => categories[0]->{ _id, title, "slug": slug.current },
      null
    )
  ),
  author->{ _id, name, image{asset->{url}} },
  body,
  difficultyLevel,
  toolsNeeded,
  materialsNeeded,
  safetyTips,
  commonMistakes,
  stepByStepInstructions,
  videoURL,
  affiliateLinks,
  projectTags,
  commentsEnabled
}
`;

const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)][].slug.current`;

// ---------- Page ----------
export default function PostPage({ post }) {
  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">Post not found</h1>
        <p className="opacity-80">The post you’re looking for doesn’t exist or isn’t available yet.</p>
        <div className="mt-6">
          <Link className="text-blue-600 underline" href="/">Go back home</Link>
        </div>
      </main>
    );
  }

  const {
    title,
    excerpt,
    seoTitle,
    seoDescription,
    publishedAt,
    category,
    mainImage,
    body,
    author,
  } = post;

  const displayTitle = title || "Untitled Post";
  const metaTitle = seoTitle || displayTitle;
  const metaDesc =
    seoDescription ||
    (typeof excerpt === "string" && excerpt.length ? excerpt : "DIY HQ article.");
  const imageUrl = mainImage?.asset?.url || null;
  const imageAlt = mainImage?.alt || displayTitle;

  const hasBody = Array.isArray(body) && body.length > 0;
  const dateText = publishedAt ? new Date(publishedAt).toLocaleDateString() : null;

  return (
    <>
      <Head>
        <title>{metaTitle} | DIY HQ</title>
        {metaDesc && <meta name="description" content={metaDesc} />}
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:title" content={metaTitle} />
        {metaDesc && <meta property="og:description" content={metaDesc} />}
        <meta property="og:type" content="article" />
      </Head>

      <article className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{displayTitle}</h1>
          <div className="mt-2 text-sm opacity-70 flex flex-wrap gap-3">
            {dateText && <span>Published {dateText}</span>}
            {category?.title && category?.slug && (
              <Link className="underline" href={`/category/${category.slug}`}>
                #{category.title}
              </Link>
            )}
            {author?.name && <span>By {author.name}</span>}
          </div>
        </header>

        {imageUrl ? (
          <div className="mb-8">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={1200}
              height={630}
              className="w-full h-auto rounded-xl"
              priority
            />
          </div>
        ) : (
          <div className="mb-8 bg-gray-100 rounded-xl w-full aspect-[1200/630] flex items-center justify-center text-sm opacity-70">
            No image provided
          </div>
        )}

        {typeof excerpt === "string" && excerpt.length > 0 && (
          <p className="text-lg leading-relaxed mb-8">{excerpt}</p>
        )}

        {hasBody ? (
          <div className="prose max-w-none">
            <PortableText value={body} />
          </div>
        ) : (
          <p className="opacity-70">This article hasn’t been populated with content yet.</p>
        )}
      </article>
    </>
  );
}

// ---------- Data fetching ----------
export async function getStaticProps({ params }) {
  try {
    const { client } = await import("../../lib/sanity.client");
    const post = await client.fetch(POST_QUERY, { slug: params.slug });
    if (!post) return { notFound: true, revalidate: 60 };
    return { props: { post }, revalidate: 60 };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}

export async function getStaticPaths() {
  try {
    const { client } = await import("../../lib/sanity.client");
    const slugs = await client.fetch(SLUGS_QUERY);
    return {
      paths: (slugs || []).map((s) => ({ params: { slug: s } })),
      fallback: "blocking",
    };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}
