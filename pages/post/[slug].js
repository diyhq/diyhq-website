// pages/post/[slug].js
import Image from 'next/image';
import { sanityFetch } from '../../lib/sanityFetch';
import { urlFor } from '../../lib/urlFor';   // ✅ fixed import

export default function PostPage({ post }) {
  if (!post) {
    return <p className="text-center py-10">Post not found.</p>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.mainImage && (
        <div className="relative w-full h-96 mb-6">
          <Image
            src={urlFor(post.mainImage).width(1200).height(600).fit('crop').url()}
            alt={post.title || 'Post image'}
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
      {post.excerpt && <p className="text-lg mb-6">{post.excerpt}</p>}
      <article className="prose max-w-none">
        {post.body && post.body}
      </article>
    </main>
  );
}

export async function getServerSideProps({ params }) {
  const slug = String(params.slug || '');

  const GROQ = `
    *[_type == "post" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      body
    }
  `;

  const post = await sanityFetch(GROQ, { slug });

  return { props: { post: post || null } };
}
