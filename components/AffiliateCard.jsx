// components/AffiliateCard.jsx
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AffiliateCard({ url }) {
  const [state, setState] = useState({
    loading: true,
    title: null,
    description: null,
    image: null,
    finalUrl: url,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/affiliate-preview?url=${encodeURIComponent(url)}`);
        const j = await r.json();
        if (!alive) return;
        setState({
          loading: false,
          title: j.title || "View →",
          description: j.description || "",
          image: j.image || null,
          finalUrl: j.url || url,
        });
      } catch {
        if (!alive) return;
        setState((s) => ({ ...s, loading: false }));
      }
    })();
    return () => { alive = false; };
  }, [url]);

  return (
    <a
      href={state.finalUrl || url}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="block rounded-lg border bg-white hover:shadow-md transition"
    >
      <div className="grid grid-cols-[80px,1fr] gap-3 p-3 items-center">
        <div className="w-20 h-20 rounded bg-gray-50 overflow-hidden flex items-center justify-center">
          {state.image ? (
            <Image
              src={state.image}
              alt=""
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-gray-400">Preview</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium leading-snug line-clamp-2">
            {state.title || "View →"}
          </div>
          {state.description && (
            <div className="mt-1 text-xs opacity-70 line-clamp-2">
              {state.description}
            </div>
          )}
          <div className="mt-1 text-xs text-blue-600">View →</div>
        </div>
      </div>
    </a>
  );
}
