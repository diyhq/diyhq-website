// pages/category/[slug].js
import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "../../lib/sanityFetch";
import { urlFor } from "../../lib/sanity";

const PER_PAGE = 12;

export default function CategoryPage({ slug, page, pageCount, posts }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 capitalize">
        {slug.replaceAll("-", " ")}
      </h1>

      {posts.length === 0 && (
        <p className="text-gray-600">No posts found in this category yet.</p>
      )}

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <li key={p.slug} className="border rounded-md overflow-hidden bg-white">
            <Link href={`/post/${p.slug}`} className="block">
              {p.mainImage && (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={urlFor(p.mainImage).width(800).height(450).fit("crop").url()}
                    alt={p.title || "Post image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium mb-1">{p.title}</h3>
                {p.excerpt && (
                  <p className="text-sm text-gray-700 line-clamp-3">{p.excerpt}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* simple prev/next */}
      {pageCount > 1 && (
        <nav className="flex items-center justify-between mt-8">
          <PageLink
            disabled={page <= 1}
            href={`/category/${slug}${page > 2 ? `?page=${page - 1}` : ""}`}
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
  const slug = params.slug;
  const page = Math.max(1, parseInt(query.page ?? "1", 10));

  // Find the category _id for references, then fetch posts that match EITHER:
  //  - reference to that category, OR
  //  - old string category whose kebab-cased value equals the slug
  const GROQ = `
  {
    "catId": *[_type == "category" && slug.current == $slug][0]._id,
    "items": *[
      _type == "post" &&
      defined(slug.current) &&
      !(_id in path("drafts.**")) &&
      publishedAt < now() &&
      (
        (defined(^.catId) && references(^.catId)) ||
        lower(replace(string(category), " ", "-")) == $slug
      )
    ] | order(publishedAt desc){
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      "categoryTitle": coalesce(category->title, string(category)),
      publishedAt
    }
  }`;

  const data = await sanityFetch(GROQ, { slug });
  const all = data?.items ?? [];

  const pageCount = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const posts = all.slice(start, start + PER_PAGE);

  return { props: { slug, page, pageCount, posts } };
}
