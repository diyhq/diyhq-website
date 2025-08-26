// components/LinkCard.jsx
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LinkCard({ url }) {
  const [data, setData] = useState({ title: "", description: "", image: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!cancelled) setData(json || {});
      } catch {
        if (!cancelled) setData({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [url]);

  const u = safeUrl(url);
  const domain = u ? u.hostname.replace(/^www\./, "") : "";

  return (
    <a
      href={url}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="group flex items-center gap-3 rounded-lg border p-3 hover:bg-orange-50 transition"
    >
      <div className="h-16 w-16 shrink-0 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
        {data?.image ? (
          <Image
            src={data.image}
            alt={data.title || domain || "Link"}
            width={64}
            height={64}
            className="h-16 w-16 object-cover"
          />
        ) : (
          <span className="text-xs opacity-60">Preview</span>
        )}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-medium line-clamp-2">
          {loading ? "Loading…" : (data?.title || domain || url)}
        </div>
        <div className="mt-1 text-[11px] opacity-70 line-clamp-2">
          {data?.description || domain}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-wide opacity-50">
          {domain}
        </div>
      </div>

      <div className="ml-auto text-xs font-semibold opacity-80 group-hover:text-orange-600">
        View
      </div>
    </a>
  );
}

function safeUrl(input) {
  try { return new URL(input); } catch { return null; }
}
