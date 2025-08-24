// pages/search.js
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sanityFetch } from '../lib/sanityFetch';
import { urlFor } from '../lib/urlFor';   // ✅ fixed import

export default function SearchPage({ initialResults }) {
  const [results, setResults] = useState(initialResults);

  async function handleSearch(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const query = form.get('q');
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.items);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Search</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          name="q"
          placeholder="Search posts..."
          className="border rounded-md px-3 py-2 w-full"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-md"
        >
          Search
        </button>
      </form>

      {results.length === 0 && <p>No results found.</p>}

      <ul className="grid sm:grid-cols-2 gap-6">
        {results.map((p) => (
          <li key={p.slug} className="border rounded-md overflow-hidden bg-white">
            <Link href={`/post/${p.slug}`} className="block">
              {p.mainImage && (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={urlFor(p.mainImage).width(600).height(338).fit('crop').url()}
                    alt={p.title || 'Post image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
    </main>
  );
}

export async function getServerSideProps() {
  const GROQ = `
    *[_type == "post" && defined(publishedAt) && !(defined(hidden) && hidden == true)] | order(publishedAt desc)[0..9]{
      title,
      "slug": slug.current,
      excerpt,
      mainImage
    }
  `;
  const initialResults = await sanityFetch(GROQ);

  return { props: { initialResults } };
}
