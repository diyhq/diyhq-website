// components/AffiliateCard.jsx
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AffiliateCard({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const r = await fetch(`/api/affiliate/preview?url=${encodeURIComponent(url)}`);
        const j = await r.json();
        if (on) setData(j);
      } catch {
        if (on) setData({ error: true });
      }
    })();
    return () => { on = false; };
  }, [url]);

  const title = data?.title || 'View on Amazon';
  const desc  = data?.description || data?.domain || '';
  const img   = data?.image || null; // already has ASIN fallback from the API
  const href  = data?.url || url;

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="group block rounded-md border p-3 hover:shadow-md transition"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={title}
            width={600}
            height={450}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs opacity-60">
            Loading…
          </div>
        )}
      </div>
      <div className="mt-2 font-medium line-clamp-2">{title}</div>
      {desc && <div className="mt-1 text-sm opacity-70 line-clamp-2">{desc}</div>}
      <div className="mt-2 text-sm text-blue-600">View</div>
    </a>
  );
}
