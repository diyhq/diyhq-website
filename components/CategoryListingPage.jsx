// components/CategoryListingPage.jsx
import Link from "next/link";
import Image from "next/image";
import Pagination from "./Pagination";
import FeaturedCarousel from "./FeaturedCarousel";

export default function CategoryListingPage({
  categoryTitle,
  slug,
  posts,
  featured,
  page,
  pageCount,
  pageSize,
}) {
  const basePath = `/category/${slug}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">{categoryTitle}</h1>

      <FeaturedCarousel items={featured} title={`Featured in ${categoryTitle}`} />

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug} className="border rounded-lg p-4 hover:shadow">
            <Link href={`/post/${p.slug}`} className="block">
              {p.image?.url && (
                <div className="relative w-full h-44 mb-3">
                  <Image
                    src={p.image.url}
                    alt={p.title}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              )}
              <h3 className="font-semibold line-clamp-2 mb-1">{p.title}</h3>
              {p.excerpt && <p className="text-sm text-gray-600 line-clamp-2">{p.excerpt}</p>}
              <p className="text-xs text-gray-500 mt-1">{p.date}</p>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination basePath={basePath} page={page} pageCount={pageCount} />

      <div className="mt-6 text-xs text-gray-500">
        Showing page {page} of {pageCount} (Page size {pageSize})
      </div>
    </main>
  );
}
