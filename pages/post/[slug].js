// pages/post/[slug].js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { sanityFetch, USE_CATEGORY_REFERENCE } from "../../lib/sanityFetch";
import { urlFor } from "../../lib/sanity";
import RichContent from "../../components/RichContent";

export default function PostPage({ post }) {
  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold mb-4">Post not found</h1>
        <Link href="/" className="text-blue-600 underline">Go home</Link>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} | DIY HQ</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          {post.mainImage && (
            <div className="relative w-full aspect-[16/9] mb-6">
              <Image
                src={urlFor(post.mainImage).width(1200).height(675).fit("crop").url()}
                alt={post.title || "Post image"}
                fill
                className="object-cover rounded"
                sizes="100vw"
              />
            </div>
          )}

          {post.body && <RichContent value={post.body} />}

          {post.categorySlug && (
            <div className="mt-8">
              <Link
                href={`/category/${post.categorySlug}`}
                className="text-sm text-blue-600 underline"
              >
                ← Back to {post.categorySlug.replaceAll("-", " ")}
              </Link>
            </div>
          )}
        </article>
      </main>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const slug = params.slug;

  // respect either reference or string category
  const categoryField = USE_CATEGORY_REFERENCE
    ? `coalesce(category->slug.current, category)`
    : `category`;

  const GROQ = `
    *[
      _type == "post" &&
      defined(slug.current) &&
      slug.current == $slug &&
      coalesce(published, true) == true &&
      !coalesce(hidden, false)
    ][0]{
      _id,
      title,
      "slug": slug.current,
      mainImage,
      excerpt,
      body,
      publishedAt,
      "categorySlug": ${categoryField}
    }
  `;

  const post = await sanityFetch(GROQ, { slug });
  if (!post) return { notFound: true };
  return { props: { post } };
}
