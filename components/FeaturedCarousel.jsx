// components/FeaturedCarousel.jsx
import Link from "next/link";
import Image from "next/image";

export default function FeaturedCarousel({ items = [], title = "Featured" }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`/post/${it.slug}`}
            className="border rounded-md p-3 hover:shadow block"
          >
            {it.image?.url && (
              <div className="relative w-full h-40 mb-2">
                <Image
                  src={it.image.url}
                  alt={it.title || "Featured"}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            <div className="text-sm font-medium line-clamp-2">{it.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
