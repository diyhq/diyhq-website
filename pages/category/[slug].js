import { useRouter } from 'next/router';
import Head from 'next/head';
import { sanityClient } from '../../lib/sanity';
import Link from 'next/link';

export default function CategoryPage({ category, posts }) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Loading...</p>;
  }

  if (!category) {
    return <p>Category not found.</p>;
  }

  return (
    <>
      <Head>
        <title>{category.title} | DIY HQ</title>
      </Head>
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-4xl font-bold mb-6">{category.title}</h1>
        {posts.length === 0 ? (
          <p>No posts in this category yet.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post._id}>
                <Link href={`/post/${post.slug.current}`}>
                  <a className="text-blue-600 hover:underline text-xl font-semibold">
                    {post.title}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

export async function getStaticProps({ params }) {
  const categoryQuery = `*[_type == "category" && slug.current == $slug][0]`;
  const postsQuery = `*[_type == "post" && category->slug.current == $slug]{
    _id,
    title,
    slug
  }`;

  const category = await sanityClient.fetch(categoryQuery, { slug: params.slug });
  const posts = await sanityClient.fetch(postsQuery, { slug: params.slug });

  if (!category) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      category,
      posts,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const query = `*[_type == "category" && defined(slug.current)][]{
    "slug": slug.current
  }`;

  const categories = await sanityClient.fetch(query);

  const paths = categories.map((category) => ({
    params: { slug: category.slug },
  }));

  return {
    paths,
    fallback: true,
  };
}
