// components/AffiliateCard.jsx
import { useEffect, useState } from "react";
import Image from "next/image";

function safeHost(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function AffiliateCard({ url }) {
  const [data, setData] = useState({
    loading: true,
    url,
    title: null,
    description: null,
    image: null,
  });

  useEffect(() => {
    let alive = true;
    const q = typeof url === "string" ? url : "";
    (async () => {
      try {
        const r = await fetch(
          `/api/affiliate-preview?url=${encodeURIComponent(q)}`
        );
        const j = await r.json();
        if (alive) setData({ loading: false, ...j });
      } catch {
        if (alive) setData((d) => ({ ...d, loading: false }));
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  const href =
    (data?.url && /^https?:\/\//i.test(data.url) && data.url) ||
    (typeof url === "string" && /^https?:\/\//i.test(url) && url) ||
    null;
  const host = href ? safeHost(href) : "";

  return (
    <a
      href={href || undefined}
      target={href ? "_blank" : undefined}
      rel={href ? "nofollow noopener noreferrer" : undefined}
      className="block rounded-lg border p-3 hover:bg-gray-50 transition"
    >
      <div className="grid grid-cols-[64px,1fr] gap-3 items-center">
        <div className="h-16 w-16 flex items-center justify-center">
          {data?.image ? (
            <Image
              src={data.image}
              alt={data?.title || "Product image"}
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
          ) : (
            <div className="h-16 w-16 rounded bg-gray-100 text-[10px] flex items-center justify-center">
              Preview
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide opacity-60">
            {host || "amazon.to"}
          </div>
          <div className="font-medium line-clamp-2">
            {data?.title || "View →"}
          </div>
          {data?.description ? (
            <div className="mt-1 text-sm opacity-80 line-clamp-2">
              {data.description}
            </div>
          ) : null}
          <div className="mt-1 text-xs text-blue-600">View →</div>
        </div>
      </div>
    </a>
  );
}
