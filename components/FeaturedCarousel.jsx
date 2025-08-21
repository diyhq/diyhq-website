// components/FeaturedCarousel.jsx
import Link from "next/link";
import Image from "next/image";

export default function FeaturedCarousel({ items = [], title = "Featured" }) {
  if (!items.length) return null;

  return (
    <section className="my-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/post/${p.slug}`}
            className="min-w-[260px] snap-start border rounded-md p-3 hover:shadow"
          >
            {p.image?.url && (
              <div className="relative w-full h-40 mb-2">
                <Image
                  src={p.image.url}
                  alt={p.title}
                  fill
                  className="object-cover rounded"
                  sizes="260px"
                />
              </div>
            )}
            <div className="text-sm font-medium line-clamp-2">{p.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
