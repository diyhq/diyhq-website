// pages/search.js
import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "../lib/sanityFetch";
import { urlFor } from "../lib/sanity";

export default function SearchPage({ q, results }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Search</h1>

      <form method="GET" action="/search" className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search DIY HQ…"
          className="w-full border rounded-md px-4 py-2"
        />
      </form>

      {!q && <p className="text-gray-600">Type something above and press Enter.</p>}
      {q && results.length === 0 && (
        <p className="text-gray-600">No results for <strong>{q}</strong>.</p>
      )}

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r) => (
          <li key={r.slug} className="border rounded-md overflow-hidden bg-white">
            <Link href={`/post/${r.slug}`} className="block">
              {r.mainImage && (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={urlFor(r.mainImage).width(800).height(450).fit("crop").url()}
                    alt={r.title || "Post image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium mb-1">{r.title}</h3>
                {r.category && (
                  <p className="text-xs text-gray-500 mb-2">{r.category}</p>
                )}
                {r.excerpt && (
                  <p className="text-sm text-gray-700 line-clamp-3">{r.excerpt}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export async function getServerSideProps({ query }) {
  const q = (query.q || "").toString().trim();
  if (!q) return { props: { q: "", results: [] } };

  // Match words prefix (case-insensitive)
  const pattern = `${q.toLowerCase()}*`;

  const GROQ = `
    *[_type == "post" && defined(slug.current) && (
      lower(title) match $pattern ||
      lower(excerpt) match $pattern ||
      lower(pt::text(body)) match $pattern
    )] | order(publishedAt desc)[0...50]{
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      "category": coalesce(category->title, category),
      publishedAt
    }
  `;

  const results = await sanityFetch(GROQ, { pattern });
  return { props: { q, results: results || [] } };
}
