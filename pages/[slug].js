// pages/[slug].js
import { groq } from 'next-sanity';
import { getClient } from '../lib/sanity.server';
import Image from 'next/image';
import Link from 'next/link';

const query = groq`
  *[_type == "post" && category->slug.current == $slug] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    mainImage {
      asset->{url, metadata}
    },
    excerpt
  }
`;

export async function getServerSideProps({ params }) {
  const posts = await getClient().fetch(query, { slug: params.slug });
  return {
    props: {
      posts,
      category: params.slug
    }
  };
}

export default function CategoryPage({ posts, category }) {
  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold capitalize mb-6">{category.replace(/-/g, ' ')} Articles</h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">No blog posts found for this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link href={`/post/${post.slug.current}`} key={post._id}>
              <a className="border rounded-2xl shadow hover:shadow-md transition overflow-hidden bg-white">
                {post.mainImage?.asset?.url && (
                  <Image
                    src={post.mainImage.asset.url}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="object-cover w-full h-48"
                  />
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">{post.excerpt}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}