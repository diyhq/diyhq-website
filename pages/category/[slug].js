// pages/category/[slug].js
import Link from "next/link";
import { sanityFetch } from "../../lib/sanityFetch";

const PER_PAGE = 15;

export default function CategoryPage({ slug, page, pageCount, posts }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 capitalize">
        {slug.replaceAll("-", " ")}
      </h1>

      {(!posts || posts.length === 0) && (
        <p className="text-gray-600">No posts found in this category yet.</p>
      )}

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(posts || []).map((p) => (
          <li key={p.slug} className="border rounded-md overflow-hidden bg-white">
            <Link href={`/post/${p.slug}`} className="block">
              {/* SAFE IMAGE: fallbacks + plain <img> (no Next image config needed) */}
              {p.imageUrl ? (
                <div className="relative w-full aspect-[16/9] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.title || "Post image"}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-[16/9] bg-gray-100 flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}

              <div className="p-4">
                <h3 className="font-medium mb-1">{p.title || "Untitled"}</h3>
                {p.excerpt ? (
                  <p className="text-sm text-gray-700 line-clamp-3">{p.excerpt}</p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {(pageCount || 1) > 1 && (
        <nav className="flex items-center justify-between mt-8">
          <PageLink
            disabled={page <= 1}
            href={`/category/${slug}${page > 2 ? `?page=${page - 1}` : ""}`}
          >
            ← Previous
          </PageLink>
          <span className="text-sm text-gray-600">Page {page} of {pageCount}</span>
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
  const slug = String(params.slug || "").toLowerCase().trim();
  const page = Math.max(1, parseInt(query.page ?? "1", 10));
  const slugPrefix = `${slug}*`; // GROQ glob (not regex)

  // Tolerant GROQ: reference category OR legacy string category (prefix)
  const GROQ = `
    *[
      _type == "post" &&
      defined(slug.current) &&
      !(_id in path('drafts.**')) &&
      (
        (defined(category->slug.current) && category->slug.current == $slug) ||
        (!defined(category._ref) && lower(string(category)) match $slugPrefix)
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc) {
      title,
      "slug": slug.current,
      "excerpt": coalesce(excerpt, blurb),
      // derive a plain URL so we can use <img>
      "imageUrl": select(
        defined(mainImage.asset->url) => mainImage.asset->url,
        defined(mainImageUrl)         => mainImageUrl,
        null
      ),
      "categoryTitle": coalesce(category->title, string(category)),
      "publishedAt": coalesce(publishedAt, _createdAt)
    }
  `;

  const all = (await sanityFetch(GROQ, { slug, slugPrefix })) || [];
  const pageCount = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const posts = all.slice(start, start + PER_PAGE);

  return { props: { slug, page, pageCount, posts } };
}
