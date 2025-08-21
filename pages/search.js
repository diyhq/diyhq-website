// pages/search.js
import Link from 'next/link';
import Image from 'next/image';
import { sanityFetch } from '../lib/sanityFetch';
import { urlFor } from '../lib/sanity';

export default function SearchPage({ q, results }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search</h1>

      <form action="/search" method="GET" className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search DIY HQ…"
          className="w-full border rounded px-3 py-2"
        />
      </form>

      {!q && <p className="text-gray-600">Type something and press Enter.</p>}

      {q && (
        <p className="text-sm text-gray-600 mb-4">
          Showing {results.length} result{results.length === 1 ? '' : 's'} for “{q}”
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r) => (
          <Link key={r.slug} href={`/post/${r.slug}`} className="block border rounded hover:shadow">
            <div className="aspect-[16/9] relative">
              {r.mainImage ? (
                <Image
                  src={urlFor(r.mainImage).width(800).height(450).url()}
                  alt={r.title}
                  fill
                  className="object-cover rounded-t"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-t" />
              )}
            </div>
            <div className="p-3">
              <div className="text-sm text-gray-500">{r.category || '—'}</div>
              <div className="font-semibold">{r.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export async function getServerSideProps({ query }) {
  const q = (query.q || '').toString().trim();

  if (!q) {
    return { props: { q: '', results: [] } };
  }

  // Simple but effective search: title or body text
  const groq = `
    *[_type == "post" && defined(slug.current) &&
      (!defined(publishedAt) || publishedAt <= now()) &&
      (
        title match $q || 
        pt::text(body) match $q
      )
    ] | order(publishedAt desc, _createdAt desc) {
      "slug": slug.current,
      title,
      mainImage,
      // try both single and array categories
      "category": coalesce(
        select(defined(category->title) => category->title),
        select(count(categories[]) > 0 => categories[0]->title),
        ""
      )
    }[0...50]
  `;

  const results = (await sanityFetch(groq, { q: `${q}*` })) ?? [];
  return { props: { q, results } };
}
