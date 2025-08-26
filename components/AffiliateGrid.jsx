// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

export default function AffiliateGrid({ links = [] }) {
  const clean = Array.isArray(links)
    ? [...new Set(links.map((x) => String(x || "").trim()).filter(Boolean))].slice(0, 8)
    : [];

  if (clean.length === 0) return null;

  return (
    <section className="my-10" aria-labelledby="rec-gear">
      <h2 id="rec-gear" className="text-xl font-semibold mb-3">
        Recommended Gear
      </h2>

      {/* 2×4 on desktop; collapses gracefully on small screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {clean.map((u, i) => (
          <AffiliateCard key={`${u}-${i}`} url={u} />
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Disclosure: As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </section>
  );
}
