import { useRouter } from 'next/router';
import Head from 'next/head';
import { sanityClient, urlFor } from '../../lib/sanity';
import { PortableText } from '@portabletext/react';

export default function Post({ post }) {
  const router = useRouter();

  if (router.isFallback) return <p>Loading…</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <>
      <Head>
        <title>{post.title} | DIY HQ</title>
        <meta name="description" content={post.seoDescription || ''} />
      </Head>

      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        {post.mainImage?.asset?._ref && (
          <img
            src={urlFor(post.mainImage).width(800).url()}
            alt={post.imageAlt || post.title}
            className="w-full rounded-lg mb-4"
          />
        )}

        <div className="text-sm text-gray-500 mb-2">
          {new Date(post.publishedAt).toLocaleDateString()}
        </div>

        <article className="prose">
          <PortableText value={post.body} />
        </article>
      </main>
    </>
  );
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;

  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    body,
    mainImage,
    imageAlt,
    publishedAt,
    category->{title},
    authorAIName,
    seoDescription
  }`;

  const post = await sanityClient.fetch(query, { slug });

  if (!post) return { notFound: true };

  return {
    props: { post },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const query = `*[_type == "post" && defined(slug.current)][]{ "slugString": slug.current }`;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post) => ({
    params: { slug: post.slugString }, // ✅ Always a raw string
  }));

  return {
    paths,
    fallback: true,
  };
}
