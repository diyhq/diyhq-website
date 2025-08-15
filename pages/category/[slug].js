// pages/category/[slug].js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { sanityClient } from '../../lib/sanity';
// If your urlFor helper lives in a separate file, use:
//   import { urlFor } from '../../lib/urlFor';
import { urlFor } from '../../lib/sanity';

export default function CategoryPage({ category, posts = [] }) {
  const router = useRouter();
  if (router.isFallback) return <p>Loading...</p>;
  if (!category) return <p>Category not found.</p>;

  return (
    <>
      <Head>
        <title>{category.title} | DIY HQ</title>
        {/* Optional: use a description field on category if you add it later */}
        {/* <meta name="description" content={category.description || category.title} /> */}
      </Head>

      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-4xl font-bold mb-6">{category.title}</h1>

        {posts.length === 0 ? (
          <p>No posts in this category yet.</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li
                key={post._id}
                className="flex items-start space-x-4 bg-white border rounded-md shadow-sm hover:shadow-md transition duration-200 p-2"
              >
                {post.mainImage?.asset?._ref && (
                  <img
                    src={urlFor(post.mainImage).width(120).height(80).url()}
                    alt={post.imageAlt || `${post.title} – ${category.title}`}
                    className="w-[120px] h-[80px] object-cover rounded-md"
                    loading="lazy"
                  />
                )}

                <div>
                  <Link href={`/post/${post.slug.current}`}>
                    <a className="text-xl font-semibold text-blue-600 hover:underline">
                      {post.title}
                    </a>
                  </Link>

                  <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                    {post.estimatedTime && <p>⏱ {post.estimatedTime}</p>}
                    {post.estimatedCost && <p>💰 {post.estimatedCost}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

export async function getStaticProps({ params }) {
  // 1) Find the category by slug
  const category = await sanityClient.fetch(
    `*[_type == "category" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current
      // description // <- include if you later add it to the schema
    }`,
    { slug: params.slug }
  );

  if (!category) return { notFound: true };

  // 2) Get posts that reference this category id (drafts excluded)
  const posts = await sanityClient.fetch(
    `*[
      _type == "post" &&
      !(_id in path("drafts.**")) &&
      references($categoryId)
    ] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage,
      imageAlt,
      estimatedTime,
      estimatedCost
    }`,
    { categoryId: category._id }
  );

  return {
    props: { category, posts },
    revalidate: 60, // ISR
  };
}

export async function getStaticPaths() {
  const slugs = await sanityClient.fetch(
    `*[_type == "category" && defined(slug.current)][]{
      "slug": slug.current
    }`
  );

  return {
    paths: slugs.map((c) => ({ params: { slug: c.slug } })),
    // 'blocking' gives full HTML on first request and caches it,
    // which tends to be nicer than showing a "Loading…" page.
    fallback: 'blocking',
  };
}
