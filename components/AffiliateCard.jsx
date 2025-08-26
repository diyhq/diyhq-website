// components/AffiliateCard.jsx
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Compact affiliate product tile:
 * - Short + wide card (h-24)
 * - Left: thumbnail
 * - Right: 2-line title, tiny host, “View” CTA
 * - Uses /api/affiliate-preview to fetch title/image/clean URL
 */
export default function AffiliateCard({ url }) {
  const [data, setData] = useState({
    title: "",
    image: "",
    url,
    loading: true,
    error: false,
  });

  // Extract a safe hostname for footer/CTA
  const host = (() => {
    try {
      return new URL(url || data.url || "").hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    let alive = true;

    async function go() {
      try {
        const res = await fetch(`/api/affiliate-preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!alive) return;
        setData((d) => ({
          ...d,
          title: json?.title || "",
          image: json?.image || "",
          url: json?.url || url,
          loading: false,
          error: false,
        }));
      } catch {
        if (!alive) return;
        setData((d) => ({ ...d, loading: false, error: true }));
      }
    }

    go();
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <Link
      href={data.url || url}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="block"
      aria-label={data.title || host || "View product"}
    >
      <article className="group flex h-24 w-full items-stretch overflow-hidden rounded-md border bg-white shadow-sm hover:shadow-md transition">
        {/* Thumbnail */}
        <div className="relative h-full w-24 flex-shrink-0 bg-gray-50">
          {data.image ? (
            <Image
              src={data.image}
              alt={data.title || host || "Product image"}
              fill
              sizes="96px"
              className="object-contain p-2"
              priority={false}
            />
          ) : (
            <div className="h-full w-full bg-gray-100" />
          )}
        </div>

        {/* Text */}
        <div className="flex min-w-0 flex-1 flex-col p-2">
          <div
            className="text-xs font-medium text-gray-900 leading-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {data.title || host || "View product"}
          </div>

          <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500">
            <span className="truncate">{host}</span>
            <span className="text-blue-600 group-hover:underline">View</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
