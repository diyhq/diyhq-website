// components/AffiliateCard.jsx
import { useEffect, useState } from "react";
import Image from "next/image";

function hostOf(url = "") {
  try {
    const h = new URL(url).hostname.replace(/^www\./i, "");
    return h || "";
  } catch {
    return "";
  }
}

export default function AffiliateCard({ url }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ title: "", description: "", image: "", url });

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const res = await fetch(`/api/affiliate/preview?url=${encodeURIComponent(url)}`);
        const j = await res.json();
        if (alive) setData((d) => ({ ...d, ...j }));
      } catch {
        // ignore; we still render a minimal tile
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [url]);

  const h = hostOf(data.url || url);
  const title = data.title || h || "View";

  return (
    <a
      href={data.url || url}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="group block rounded-md border bg-white hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      {/* Horizontal compact tile: image left, text right */}
      <div className="grid grid-cols-[96px,1fr] gap-3 p-3 items-center">
        <div className="relative w-[96px] h-[96px] rounded bg-gray-100 overflow-hidden">
          {data.image ? (
            <Image
              src={data.image}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="96px"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-xs text-gray-400">
              {loading ? "…" : "No image"}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {h ? <div className="text-[11px] uppercase tracking-wide text-gray-500">{h}</div> : null}
          <div className="mt-0.5 font-medium text-sm leading-5 line-clamp-2">{title}</div>
          <div className="mt-1 text-[12px] text-orange-600 underline">View</div>
        </div>
      </div>
    </a>
  );
}
