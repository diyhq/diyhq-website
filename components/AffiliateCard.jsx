// components/AffiliateCard.jsx
import { useEffect, useState } from "react";
import Image from "next/image";

function isHttpUrl(u) {
  if (typeof u !== "string") return false;
  const s = u.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    // guard: only call new URL when it looks like a URL
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function hostFrom(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export default function AffiliateCard({ url }) {
  const valid = isHttpUrl(url);
  const [data, setData] = useState({
    title: null,
    description: null,
    image: null,
  });

  // Fetch preview only for valid URLs
  useEffect(() => {
    let on = true;
    if (!valid) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/affiliate-preview?url=${encodeURIComponent(url)}`
        );
        const json = await res.json();
        if (on) setData(json || {});
      } catch {
        /* ignore */
      }
    })();
    return () => {
      on = false;
    };
  }, [url, valid]);

  const domain = valid ? hostFrom(url) : null;
  const title =
    data.title ||
    (valid ? domain : null) ||
    "Amazon product"; // final fallback

  return (
    <a
      href={valid ? url : undefined}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="block rounded-lg border p-3 hover:bg-gray-50 transition"
      aria-label={valid ? `View ${title}` : "View on Amazon"}
    >
      {/* compact horizontal row: thumbnail left, text right */}
      <div className="grid grid-cols-[80px,1fr] items-center gap-3">
        <div className="h-20 w-20 rounded border bg-white overflow-hidden flex items-center justify-center">
          {data.image ? (
            <Image
              src={data.image}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
            />
          ) : (
            <span className="text-xs opacity-50">Preview</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide opacity-60">
            {domain || "amzn.to"}
          </div>
          <div className="font-medium leading-snug line-clamp-2">{title}</div>
          {data.description && (
            <div className="text-sm opacity-70 line-clamp-1">
              {data.description}
            </div>
          )}
          <div className="mt-1 text-sm font-medium text-blue-600">View →</div>
        </div>
      </div>
    </a>
  );
}
