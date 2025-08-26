// components/AffiliateCard.jsx
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AffiliateCard({ url }) {
  const [data, setData] = useState({ loading: true, title: "", description: "", image: null });

  useEffect(() => {
    let alive = true;
    async function go() {
      try {
        const res = await fetch(`/api/affiliate-preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!alive) return;
        setData({ loading: false, title: json.title || "", description: json.description || "", image: json.image || null });
      } catch {
        if (!alive) return;
        setData({ loading: false, title: "", description: "", image: null });
      }
    }
    go();
    return () => { alive = false; };
  }, [url]);

  const linkHost = (() => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  })();

  const thumb = data.image || "/images/logo/DIY_HQ_Logo_WhiteBackground.jpg";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="group grid grid-cols-[96px,1fr] gap-3 rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition"
    >
      <div className="relative h-24 w-24 overflow-hidden rounded">
        <Image
          src={thumb}
          alt={data.title || "Product"}
          width={96}
          height={96}
          className="h-24 w-24 object-cover"
          priority={false}
        />
      </div>

      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide opacity-60">{linkHost || "Amazon"}</div>
        <div className="mt-1 line-clamp-2 font-medium leading-snug">
          {data.loading ? "Preview…" : (data.title || "View product")}
        </div>
        {data.description ? (
          <div className="mt-1 line-clamp-2 text-sm opacity-80">{data.description}</div>
        ) : null}
        <div className="mt-2 text-sm font-medium text-blue-600 group-hover:underline">View</div>
      </div>
    </a>
  );
}
