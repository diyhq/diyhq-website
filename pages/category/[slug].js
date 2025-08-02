import { useRouter } from 'next/router';
import Head from 'next/head';
import { sanityClient, urlFor } from '../../lib/sanity';
import Link from 'next/link';

export default function CategoryPage({ category, posts }) {
  const router = useRouter();

  if (router.isFallback) return <p>Loading...</p>;
  if (!category) return <p>Category not found.</p>;

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
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post._id} className="flex items-start space-x-4">
                {post.mainImage?.asset?._ref && (
                  <img
                    src={urlFor(post.mainImage).width(120).height(80).url()}
                    alt={post.imageAlt || post.title}
                    className="w-[120px] h-[80px] object-cover rounded-md"
                  />
                )}
                <div>
                  <Link href={`/post/${post.slug.current}`}>
                    <a className="text-xl font-semibold text-blue-600 hover:underline">
                      {post.title}
                    </a>
                  </Link>
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
  const categoryQuery = `*[_type == "category" && slug.current == $slug][0]`;
  const category = await sanityClient.fetch(categoryQuery, { slug: params.slug });

  if (!category) {
    return { notFound: true };
  }

  const postsQuery = `*[_type == "post" && category._ref == $categoryId]{
    _id,
    title,
    slug,
    mainImage,
    imageAlt
  }`;

  const posts = await sanityClient.fetch(postsQuery, { categoryId: category._id });

  return {
    props: {
      category,
      posts,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const query = `*[_type == "category" && defined(slug.current)][]{ "slug": slug.current }`;
  const categories = await sanityClient.fetch(query);

  const paths = categories.map((category) => ({
    params: { slug: category.slug },
  }));

  return {
    paths,
    fallback: true,
  };
}
