// pages/category/[slug].js
import Link from 'next/link';
import Image from 'next/image';
import { sanityFetch } from '../../lib/sanityFetch';
import { urlFor } from '../../lib/urlFor';

const PER_PAGE = 15;

export default function CategoryPage({ slug, page, pageCount, posts }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 capitalize">
        {slug.replaceAll('-', ' ')}
      </h1>

      {!posts || posts.length === 0 ? (
        <p className="text-gray-600">No posts found in this category yet.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <li
              key={p.slug}
              className="border rounded-md overflow-hidden bg-white"
            >
              <Link href={`/post/${p.slug}`} className="block">
                {p.mainImage ? (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={urlFor(p.mainImage).width(800).height(450).fit('crop').url()}
                      alt={p.mainImage?.alt || p.title || 'Post image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-200 aspect-[16/9] flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium mb-1">{p.title}</h3>
                  {p.excerpt ? (
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {p.excerpt}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No excerpt available.
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav className="flex items-center justify-between mt-8">
          <PageLink
            disabled={page <= 1}
            href={`/category/${slug}${page > 2 ? `?page=${page - 1}` : ''}`}
          >
            ← Previous
          </PageLink>
          <span className="text-sm text-gray-600">
            Page {page} of {pageCount}
          </span>
          <PageLink
            disabled={page >= pageCount}
            href={`/category/${slug}?page=${page + 1}`}
          >
            Next →
          </PageLink>
        </nav>
      )}
    </main>
  );
}

function PageLink({ href, disabled, children }) {
  if (disabled) {
    return (
      <span className="px-4 py-2 border rounded-md text-gray-400 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="px-4 py-2 border rounded-md hover:bg-gray-50">
      {children}
    </Link>
  );
}

export async function getServerSideProps({ params, query }) {
  const slug = String(params.slug || '').toLowerCase();
  const page = Math.max(1, parseInt(query.page ?? '1', 10));

  const GROQ = `
    *[
      _type == "post" &&
      !(defined(hidden) && hidden == true) &&
      defined(slug.current) &&
      (
        category->slug.current == $slug ||
        lower(replace(coalesce(category->slug.current, string(category)), "[^a-z0-9]+", "-")) == $slug
      )
    ] | order(publishedAt desc) {
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      "categorySlug": category->slug.current,
      "categoryTitle": coalesce(category->title, category),
      publishedAt
    }
  `;

  const all = (await sanityFetch(GROQ, { slug })) || [];
  const pageCount = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const posts = all.slice(start, start + PER_PAGE);

  return { props: { slug, page, pageCount, posts } };
}
