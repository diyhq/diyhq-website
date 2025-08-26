// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

function pickUrl(item) {
  if (!item) return null;
  if (typeof item === "string") return item;
  if (typeof item === "object") return item.url || item.href || item.link || null;
  return null;
}

function isHttpUrl(u) {
  if (typeof u !== "string") return false;
  const s = u.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export default function AffiliateGrid({ links = [] }) {
  // Keep only real URLs so SSR never crashes
  const urls = links.map(pickUrl).filter(isHttpUrl);
  if (urls.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-3">Recommended Gear</h2>

      {/* 2 x 4 compact horizontal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {urls.slice(0, 8).map((u, i) => (
          <AffiliateCard key={`${u}-${i}`} url={u} />
        ))}
      </div>

      <p className="mt-2 text-xs opacity-60">
        Disclosure: As an Amazon Associate, we may earn from qualifying purchases
        at no extra cost to you.
      </p>
    </section>
  );
}
