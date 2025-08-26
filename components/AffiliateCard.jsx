// components/AffiliateCard.jsx
import { useEffect, useState } from "react";

export default function AffiliateCard({ url }) {
  const [data, setData] = useState({
    loading: true,
    error: false,
    title: "",
    description: "",
    image: null,
    url: url || "",
    host: "",
  });

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const res = await fetch(`/api/affiliate/preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!alive) return;

        const u = new URL(json?.url || url);
        setData({
          loading: false,
          error: false,
          title: json?.title || u.hostname.replace(/^www\./, ""),
          description: json?.description || "",
          image: json?.image || null,
          url: json?.url || url,
          host: u.hostname.replace(/^www\./, ""),
        });
      } catch (e) {
        if (!alive) return;
        const u = new URL(url);
        setData({
          loading: false,
          error: true,
          title: u.hostname.replace(/^www\./, ""),
          description: "",
          image: null,
          url,
          host: u.hostname.replace(/^www\./, ""),
        });
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [url]);

  const A = ({ children, className = "" }) => (
    <a
      href={data.url || url}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className={`group block rounded-lg border bg-white hover:shadow-sm transition ${className}`}
      aria-label="View on Amazon (opens in new tab)"
    >
      {children}
    </a>
  );

  // --- Compact horizontal row (thumbnail left, text right)
  // Height target: ~96px on md+, ~84px on mobile
  return (
    <A className="p-3">
      <div className="flex items-start gap-3 md:gap-4 min-h-[84px] md:min-h-[96px]">
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded bg-gray-100 overflow-hidden border">
          {data.image ? (
            // Using <img> keeps it simple; Next/Image is allowed too if remotePatterns are set.
            <img
              src={data.image}
              alt={data.title || "Amazon product"}
              className="absolute inset-0 w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
              Preview
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-snug text-gray-900 line-clamp-2">
            {data.title || data.host}
          </div>
          {data.description ? (
            <div className="mt-1 text-xs text-gray-600 leading-snug line-clamp-2">
              {data.description}
            </div>
          ) : null}

          <div className="mt-2 text-xs font-medium text-orange-600">
            View <span aria-hidden>→</span>
          </div>
        </div>
      </div>
    </A>
  );
}
