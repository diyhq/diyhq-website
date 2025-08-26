// components/AffiliateCard.jsx
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AffiliateCard({ url }) {
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/affiliate-preview?url=${encodeURIComponent(url)}`);
        const json = await r.json();
        if (!alive) return;
        setData({ loading: false, ...json });
      } catch {
        if (!alive) return;
        setData({ loading: false, ok: false });
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  const title =
    data?.title?.replace(/\s+\|\s*Amazon.*$/i, '').trim() ||
    new URL(url).hostname.replace(/^www\./, '');

  return (
    <a
      href={data?.url || url}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="group block rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
      aria-label={title || 'View product on Amazon'}
    >
      <div className="flex items-stretch">
        {/* Thumb */}
        <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 border-r overflow-hidden bg-gray-50">
          {data?.image ? (
            <Image
              src={data.image}
              alt={title || 'Product image'}
              fill
              sizes="(max-width: 640px) 7rem, 8rem"
              className="object-contain"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-xs text-gray-400">
              Preview
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          <div className="text-sm font-semibold text-gray-900 leading-snug truncate group-hover:text-orange-600">
            {title || 'View →'}
          </div>
          {data?.description ? (
            <p className="mt-1 text-xs text-gray-600 line-clamp-3">{data.description}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">View →</p>
          )}
        </div>
      </div>
    </a>
  );
}
