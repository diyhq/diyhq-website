import { useEffect, useState } from "react";

/**
 * Small, text‑forward affiliate card.
 * - Pulls title/description/thumbnail via /api/affiliate-preview
 * - If Amazon/host blocks the image, we still show a strong title+domain
 */
export default function AffiliateCard({ url }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const res = await fetch(`/api/affiliate-preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (on) setData(json?.ok ? json : null);
      } catch {
        if (on) setData(null);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [url]);

  let domain = "";
  try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch {}

  const title = data?.title || domain || "View";
  const image = data?.image || null;
  const desc  = data?.description || null;

  return (
    <a
      href={url}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="group block rounded-lg border bg-white hover:shadow-md transition"
    >
      {/* Image first, but optional */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-50">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
            Preview
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-xs text-gray-500 truncate">{domain}</div>
        <div className="mt-1 text-sm font-medium leading-5 line-clamp-3">{title}</div>
        {desc ? <div className="mt-1 text-xs text-gray-500 line-clamp-2">{desc}</div> : null}
        <div className="mt-2 text-xs font-medium text-orange-600 group-hover:underline">
          View
        </div>
      </div>
    </a>
  );
}
